package sherby.ride.api;

import static jakarta.ws.rs.core.Response.Status.BAD_REQUEST;
import static jakarta.ws.rs.core.Response.Status.CREATED;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.StringJoiner;

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
import sherby.ride.db.Trajet;

@Path("/trajet")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TrajetResource {

    @Inject
    UserInfo userInfo;

    @GET
    public Uni<List<Trajet>> get(@QueryParam(value = "from") String departure,
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

        return Trajet.list(queryBuilder.toString(), Sort.by("departureTime"), params.toArray());
    }

    @GET
    @Path("{id}")
    public Uni<Trajet> getSingle(Long id) {
        return Trajet.findById(id);
    }

    @POST
    @Authenticated
    public Uni<Response> create(CreateTrajetJson json) {
        if (json.driver == null || !json.driver.equals(userInfo.getPreferredUserName())) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST)
                    .entity("Conducteur non-valide").build());
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
                    .entity("Vous devez entrer une date de départ").build());
        }

        return Panache.withTransaction(() -> Profile.<Profile>findById(json.driver)
                .onItem().ifNotNull().transform(driver -> new Trajet(json.departureLoc, json.arrivalLoc,
                        json.departureTime, json.maxPassengers, driver))
                .onItem().ifNotNull().transformToUni(trajet -> trajet.<Trajet>persist())
                .onItem().ifNotNull().transform(trajet -> Response.ok(trajet).status(CREATED).build())
                .onItem().ifNull().continueWith(Response.status(BAD_REQUEST).entity(json).build()));
    }

    private record CreateTrajetJson(String departureLoc,
            String arrivalLoc,
            Date departureTime,
            int maxPassengers,
            String driver) {
    }
}
