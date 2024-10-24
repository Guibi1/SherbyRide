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
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
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
    public Uni<List<RideDOT>> get(@QueryParam(value = "from") String departure,
            @QueryParam(value = "to") String arrival,
            @QueryParam(value = "date") Instant date,
            @QueryParam(value = "passengers") Integer minPassengers) {
        List<Object> params = new ArrayList<>(5);
        StringJoiner queryBuilder = new StringJoiner(" AND ");
        if (userInfo.getPreferredUserName() != null) {
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

        return Trajet.<Trajet>list(queryBuilder.toString(), Sort.by("departureTime"), params.toArray())
                .onItem().transformToUni(list -> {
                    List<Uni<RideDOT>> unis = list.stream()
                            .map(trajet -> Mutiny.fetch(trajet.driver)
                                    .onItem().transformToUni(driver -> driver.getRatings())
                                    .onItem().transform(ratings -> toRideDOT(trajet, ratings)))
                            .toList();
                    if (unis.isEmpty())
                        return Uni.createFrom().item(new ArrayList<RideDOT>());
                    return Uni.join().all(unis).andCollectFailures();
                });
    }

    @GET
    @Path("{id}")
    public Uni<RideDOT> getSingle(Long id) {
        return Trajet.<Trajet>findById(id)
                .onItem().transformToUni(trajet -> Mutiny.fetch(trajet.driver)
                        .onItem().transformToUni(driver -> driver.getRatings())
                        .onItem().transform(ratings -> toRideDOT(trajet, ratings)));
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
                () -> Profile.<Profile>findById(json.driver).onItem().ifNotNull().transformToUni(driver -> {
                    var trajet = new Trajet(json.departureLoc, json.arrivalLoc, json.departureTime, json.maxPassengers,
                            driver);
                    return trajet.<Trajet>persist();
                })
                        .onItem().ifNotNull().transform(trajet -> Response.ok(trajet).status(CREATED).build()))
                .onItem().ifNull().continueWith(Response.ok().status(BAD_REQUEST)::build);
    }

    private static RideDOT toRideDOT(Trajet ride, ProfileRatings ratings) {
        return new RideDOT(ride.id, ride.departureLoc, ride.arrivalLoc,
                ride.departureTime,
                ride.maxPassengers, ratings);
    }

    private record RideDOT(
            Long id,
            String departureLoc,
            String arrivalLoc,
            Date departureTime,
            int maxPassengers,
            ProfileRatings ratings) {
    }

    private record CreateRideDOT(String departureLoc, String arrivalLoc, Date departureTime, int maxPassengers,
            String driver) {
    }
}
