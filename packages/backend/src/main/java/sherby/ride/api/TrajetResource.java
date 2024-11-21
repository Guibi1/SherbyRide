package sherby.ride.api;

import static jakarta.ws.rs.core.Response.Status.BAD_REQUEST;
import static jakarta.ws.rs.core.Response.Status.CREATED;
import static jakarta.ws.rs.core.Response.Status.FORBIDDEN;
import static jakarta.ws.rs.core.Response.Status.NOT_FOUND;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.StringJoiner;
import java.util.stream.Stream;

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
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import sherby.ride.db.Car;
import sherby.ride.db.PassengerState;
import sherby.ride.db.Profile;
import sherby.ride.db.Profile.ProfileRatings;
import sherby.ride.db.RidePassenger;
import sherby.ride.db.Trajet;

@Path("/trajet")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TrajetResource {
    @Inject
    private UserInfo userInfo;

    @GET
    public Uni<List<RideDOT>> get(
            @QueryParam(value = "from") String departure,
            @QueryParam(value = "to") String arrival,
            @QueryParam(value = "date") Instant date,
            @QueryParam(value = "passengers") Integer minPassengers) {
        List<Object> params = new ArrayList<>(5);
        StringJoiner queryBuilder = new StringJoiner(" AND ");
        if (userInfo.getPreferredUserName() != null) {
            queryBuilder.add("driver.id != ?" + (params.size() + 1));
            params.add(userInfo.getPreferredUserName());

            queryBuilder.add("NOT EXISTS (" +
                    "SELECT 1 FROM RidePassenger rp WHERE rp MEMBER OF passengers AND rp.passenger.id = ?"
                    + (params.size() + 1) +
                    ")");
            params.add(userInfo.getPreferredUserName());
        }
        if (departure != null && !departure.isEmpty()) {
            queryBuilder.add("departureLoc ILIKE ?" + (params.size() + 1));
            params.add("%" + departure + "%");
        }
        if (arrival != null && !arrival.isEmpty()) {
            queryBuilder.add("arrivalLoc ILIKE ?" + (params.size() + 1));
            params.add("%" + arrival + "%");
        }
        if (date != null) {
            queryBuilder.add("departureTime = ?" + (params.size() + 1));
            params.add(Date.from(date));
        } else {
            queryBuilder.add("departureTime >= ?" + (params.size() + 1));
            params.add(new Date());
        }

        queryBuilder.add("maxPassengers - size(passengers) >= ?" + (params.size() + 1));
        params.add(minPassengers != null ? Math.max(minPassengers, 1) : 1);

        return Trajet.<Trajet>list(queryBuilder.toString(), Sort.by("departureTime"), params.toArray())
                .onItem().transformToMulti(rides -> Multi.createFrom().iterable(rides))
                .onItem().transformToUniAndConcatenate(ride -> ride.getReservedSeats().chain(
                        seats -> ride.driver.getRatings().onItem()
                                .transform((ratings) -> toRideDOT(ride,
                                        seats, ratings, null, null, null, null))))
                .collect().asList();
    }

    @GET
    @Path("/me")
    public Uni<List<MyRideDOT>> get() {
        return Panache.withTransaction(() -> Profile.<Profile>findById(userInfo.getPreferredUserName())
                .chain(profile -> {
                    var ridesDOTUni = Mutiny.fetch(profile.rides).onItem()
                            .transformToMulti(rides -> Multi.createFrom().iterable(rides))
                            .onItem().transformToUniAndConcatenate(
                                    ride -> ride.driver.getRatings()
                                            .chain(ratings -> ride
                                                    .getReservedSeats()
                                                    .onItem()
                                                    .transform(seats -> toMyRideDOT(
                                                            ride,
                                                            ratings,
                                                            seats,
                                                            true))))
                            .collect().asList();

                    return ridesDOTUni.chain(ridesDOT -> Mutiny.fetch(profile.passengerInRides)
                            .onItem()
                            .transformToMulti(rides -> Multi.createFrom().iterable(rides))
                            .onItem()
                            .transformToUniAndConcatenate(rp -> Mutiny.fetch(rp.ride).chain(
                                    ride -> ride.driver.getRatings()
                                            .chain(ratings -> ride
                                                    .getReservedSeats()
                                                    .onItem()
                                                    .transform(seats -> toMyRideDOT(
                                                            ride,
                                                            ratings,
                                                            seats,
                                                            false)))))
                            .collect().asList()
                            .onItem().transform(passengerInRidesDOT -> Stream
                                    .concat(ridesDOT.stream(),
                                            passengerInRidesDOT.stream())
                                    .toList()));

                }));
    }

    @GET
    @Path("{id}")
    public Uni<RideDOT> getSingle(Long id) {
        var userCip = userInfo.getPreferredUserName();

        return Trajet.<Trajet>findById(id)
                .chain(ride -> ride.driver.getRatings()
                        .chain(ratings -> ride.getReservedSeats()
                                .chain(seats -> {
                                    if (ride.driver.cip.equals(userCip)) {
                                        return Mutiny.fetch(ride.car)
                                                .chain(car -> Mutiny.fetch(ride.passengers).onItem()
                                                        .transform(
                                                                rp -> toRideDOT(ride, seats, ratings, car, "MINE",
                                                                        null, rp)));
                                    }

                                    var state = (userCip != null)
                                            ? ride.passengers.stream().filter(rp -> rp.passenger.cip.equals(userCip))
                                                    .map(rp -> rp.state)
                                                    .findFirst().orElse(null)
                                            : null;

                                    if (state == PassengerState.ACCEPTED) {
                                        return Mutiny.fetch(ride.car).chain(car -> Mutiny.fetch(ride.driver).onItem()
                                                .transform(
                                                        driver -> toRideDOT(ride, seats, ratings, car, state.toString(),
                                                                driver, null)));
                                    }

                                    return Uni.createFrom()
                                            .item(toRideDOT(ride, seats, ratings, null, state.toString(), null, null));
                                })));
    }

    @PUT
    @Path("{id}")
    @Authenticated
    public Uni<Response> bookRide(Long id) {
        String cip = userInfo.getPreferredUserName();

        return Panache.withTransaction(() -> Profile.<Profile>findById(cip)
                .chain(user -> Trajet.<Trajet>findById(id)
                        .chain(trajet -> {
                            if (trajet.driver == user)
                                return Uni.createFrom().nullItem();

                            return Mutiny.fetch(trajet.passengers).onItem()
                                    .transformToUni(passengers -> {
                                        if (trajet.passengers.stream().anyMatch(
                                                rp -> rp.getPassenger()
                                                        .equals(user))) {
                                            return Uni.createFrom()
                                                    .nullItem();
                                        }

                                        RidePassenger ridePassenger = new RidePassenger(
                                                trajet, user,
                                                PassengerState.PENDING);
                                        passengers.add(ridePassenger);
                                        return trajet.<Trajet>persist();
                                    });
                        }))
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
                        .chain(driver -> Car.<Car>findById(json.licencePlate)
                                .chain(car -> new Trajet(json.departureLoc,
                                        json.arrivalLoc,
                                        json.departureTime,
                                        json.maxPassengers,
                                        List.<RidePassenger>of(), driver, car)
                                        .<Trajet>persist()))
                        .onItem().ifNotNull()
                        .transform(trajet -> Response.ok(trajet).status(CREATED).build())
                        .onItem().ifNull()
                        .continueWith(Response.ok().status(BAD_REQUEST)::build));
    }

    @DELETE
    @Path("{id}")
    @Authenticated
    public Uni<Response> deleteRide(@PathParam("id") Long id) {
        String userId = userInfo.getPreferredUserName();

        return Panache.withTransaction(() -> Trajet.<Trajet>findById(id)
                .onItem().ifNotNull().transformToUni(trajet -> {
                    if (!trajet.driver.cip.equals(userId)) {
                        return Uni.createFrom().item(Response.status(FORBIDDEN).build());
                    }
                    if (trajet.departureTime.before(new Date())) {
                        return Uni.createFrom().item(Response.status(FORBIDDEN).build());
                    }

                    // Supprime le trajet
                    return trajet.delete().onItem().transform(deleted -> Response.ok().build());
                })
                .onItem().ifNull().continueWith(Response.status(NOT_FOUND)::build));
    }

    @GET
    @Path("{id}/notifications")
    @Authenticated
    public Uni<List<Profile>> getPendingPassengers(@PathParam("id") Long rideId) {
        return RidePassenger.<RidePassenger>list("ride.id = ?1 and state = ?2", rideId, PassengerState.PENDING)
                .onItem().transformToMulti(rides -> Multi.createFrom().iterable(rides))
                .onItem().transform(rp -> rp.getPassenger())
                .collect().asList();
    }

    private static RideDOT toRideDOT(Trajet ride, int reservedSeats, ProfileRatings ratings, Car car,
            String request, Profile driver, List<RidePassenger> passengers) {
        return new RideDOT(ride.id, ride.departureLoc, ride.arrivalLoc,
                ride.departureTime,
                ride.maxPassengers, reservedSeats, ratings, car, request, driver, passengers);
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
            ProfileRatings ratings, Car car, String request, Profile driver, List<RidePassenger> passengers) {
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
