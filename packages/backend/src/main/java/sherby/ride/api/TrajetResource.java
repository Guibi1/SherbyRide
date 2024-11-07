package sherby.ride.api;

import static jakarta.ws.rs.core.Response.Status.BAD_REQUEST;
import static jakarta.ws.rs.core.Response.Status.CREATED;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.StringJoiner;

import org.hibernate.reactive.mutiny.Mutiny;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.oidc.UserInfo;
import io.quarkus.panache.common.Sort;
import io.quarkus.security.Authenticated;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import sherby.ride.db.Car;
import sherby.ride.db.Profile;
import sherby.ride.db.Profile.ProfileRatings;
import sherby.ride.db.Trajet;

@Path("/trajet")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)

public class TrajetResource {
    @Inject
    private UserInfo userInfo;

    @GET
    public Uni<List<RideDOT>> get(@QueryParam(value = "mine") Boolean myRides,
            @QueryParam(value = "from") String departure,
            @QueryParam(value = "to") String arrival,
            @QueryParam(value = "date") Instant date,
            @QueryParam(value = "passengers") Integer minPassengers) {
        List<Object> params = new ArrayList<>(5);
        StringJoiner queryBuilder = new StringJoiner(" AND ");
        if (userInfo.getPreferredUserName() != null) {
            if (myRides != null && myRides)
                queryBuilder.add("driver.id = ?" + (params.size() + 1));
            else
                queryBuilder.add("driver.id != ?" + (params.size() + 1));
            params.add(userInfo.getPreferredUserName());
        }
        if (departure != null && !departure.isEmpty()) {
            queryBuilder.add("departureLoc = ?" + (params.size() + 1));
            params.add(departure);
        }
        if (arrival != null && !arrival.isEmpty()) {
            queryBuilder.add("arrivalLoc = ?" + (params.size() + 1));
            params.add(arrival);
        }
        if (date != null) {
            queryBuilder.add("departureTime = ?" + (params.size() + 1));
            params.add(Date.from(date));
        }
        if (minPassengers != null) {
            queryBuilder.add("maxPassengers >= ?" + (params.size() + 1));
            params.add(minPassengers);
        }

        return Panache.withTransaction(
                () -> Trajet.<Trajet>list(queryBuilder.toString(), Sort.by("departureTime"), params.toArray())
                        .onItem().transformToMulti(trajets -> Multi.createFrom().iterable(trajets))
                        .onItem().transformToUniAndConcatenate(ride -> Uni.combine().all()
                                        .unis(Mutiny.fetch(ride.driver), Mutiny.fetch(ride.car),
                                                ride.getReservedSeats())
                                        .withUni((driver, car, seats) -> driver.getRatings()
                                                .onItem()
                                                .<RideDOT>transform(ratings -> toRideDOT(ride, seats, ratings, car)))).collect().asList());
    }

    @GET
    @Path("/me")
    public Uni<List<MyRideDOT>> get() {
        return Panache.withTransaction(() -> Profile.<Profile>findById(userInfo.getPreferredUserName())
                .onItem()
                .transformToUni(profile -> Uni.combine().all()
                        .unis(Mutiny.fetch(profile.rides), Mutiny.fetch(profile.passengerInRides))
                        .withUni((rides, passengerInRides) -> {
                            var multiRide = Multi.createFrom().iterable(rides)
                                    .onItem().transformToUni(ride -> Uni.combine()
                                            .all()
                                            .unis(Mutiny.fetch(ride.driver), ride.getReservedSeats())
                                            .withUni((driver, seats) -> driver.getRatings().onItem()
                                                    .transform(ratings -> toMyRideDOT(ride, ratings, seats, true))))
                                    .concatenate();
                            var multiPassengerRide = Multi.createFrom().iterable(passengerInRides)
                                    .onItem().transformToUni(ride -> Uni.combine()
                                            .all()
                                            .unis(Mutiny.fetch(ride.driver), ride.getReservedSeats())
                                            .withUni((driver, seats) -> driver.getRatings().onItem()
                                                    .transform(ratings -> toMyRideDOT(ride, ratings, seats, false))))
                                    .concatenate();

                            return Multi.createBy().merging().streams(multiRide, multiPassengerRide).collect()
                                    .asList();
                        })));
    }

    @GET
    @Path("{id}")
    public Uni<RideDOT> getSingle(Long id) {
        return Trajet.<Trajet>findById(id)
                .chain(trajet -> trajet.getReservedSeats()
                        .chain(seats -> trajet.driver.getRatings().chain(ratings -> Mutiny.fetch(trajet.car)
                                .onItem().transform(car -> toRideDOT(trajet, seats, ratings, car)))));
    }

    @PUT
    @Path("{id}")
    @Authenticated
    public Uni<Response> bookRide(Long id) {
        String cip = userInfo.getPreferredUserName();

        return Panache.withTransaction(
                () -> Uni.combine().all().unis(Profile.<Profile>findById(cip), Trajet.<Trajet>findById(id))
                        .withUni((user, trajet) -> {
                            if (trajet.driver == user)
                                return Uni.createFrom().nullItem();

                            return Mutiny.fetch(trajet.passengers).onItem().transformToUni(passengers -> {
                                if (passengers.contains(user))
                                    return Uni.createFrom().nullItem();

                                passengers.add(user);
                                return trajet.<Trajet>persist();
                            });
                        })
                        .onItem().ifNotNull().transform(trajet -> Response.ok(trajet).status(CREATED).build())
                        .onItem().ifNull().continueWith(Response.status(BAD_REQUEST)::build));
    }

    @POST
    @Authenticated
    public Uni<Response> create(CreateRideDOT json) {

        if (!json.driver.equals(userInfo.getPreferredUserName())) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST)
                    .entity("Conducteur invalide").build());
        }

        if (json.departureLoc == null || json.departureLoc.isEmpty()) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST)
                    .entity("Vous devez entrer un lieu de départ").build());
        }

        if (json.arrivalLoc == null || json.arrivalLoc.isEmpty()) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST)
                    .entity("Vous devez entrer un lieu d'arrivée").build());
        }

        if (json.departureTime == null || json.departureTime.before(new Date())) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST)
                    .entity("Vous devez entrer un temps de départ").build());
        }

        return Panache.withTransaction(
                () -> Profile.<Profile>findById(json.driver)
                        .chain(driver -> Car.<Car>findById(json.licencePlate).chain(car -> {
                            var trajet = new Trajet(json.departureLoc, json.arrivalLoc, json.departureTime,
                                    json.maxPassengers,
                                    List.<Profile>of(), driver, car);
                            return trajet.<Trajet>persist();
                        }))
                        .onItem().ifNotNull().transform(trajet -> Response.ok(trajet).status(CREATED).build()))
                .onItem().ifNull().continueWith(Response.ok().status(BAD_REQUEST)::build);
    }

    private static RideDOT toRideDOT(Trajet ride, int reservedSeats, ProfileRatings ratings, Car car) {
        return new RideDOT(ride.id, ride.departureLoc, ride.arrivalLoc,
                ride.departureTime,
                ride.maxPassengers, reservedSeats, ratings, car);
    }

    private static MyRideDOT toMyRideDOT(Trajet ride, ProfileRatings ratings, int reservedSeats, boolean mine) {
        return new MyRideDOT(ride.id, ride.departureLoc, ride.arrivalLoc,
                ride.departureTime,
                ride.maxPassengers,
                reservedSeats,
                ratings, mine);
    }

    private record RideDOT(
            Long id,
            String departureLoc,
            String arrivalLoc,
            Date departureTime,
            int maxPassengers,
            int reservedSeats,
            ProfileRatings ratings,
            Car car) {
    }

    private record MyRideDOT(
            Long id,
            String departureLoc,
            String arrivalLoc,
            Date departureTime,
            int maxPassengers,
            int reservedSeats,
            ProfileRatings ratings, boolean mine) {
    }

    private record CreateRideDOT(String departureLoc, String arrivalLoc, Date departureTime, int maxPassengers,
            String driver, String licencePlate) {
    }
}
