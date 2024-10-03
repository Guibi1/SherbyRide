package sherby.ride.api;

import static jakarta.ws.rs.core.Response.Status.BAD_REQUEST;
import static jakarta.ws.rs.core.Response.Status.CREATED;

import java.util.Date;
import java.util.List;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.panache.common.Sort;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import sherby.ride.db.Profile;
import sherby.ride.db.Trajet;

@Path("/trajet")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TrajetResource {

    @GET
    public Uni<List<Trajet>> get() {
        return Trajet.listAll(Sort.by("publication_id"));
    }

    @GET
    @Path("{id}")
    public Uni<Trajet> getSingle(Long id) {
        return Trajet.findById(id);
    }

    @POST
    public Uni<Response> create(CreateTrajetJson json) {
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
                    .entity("Vous devez entrer un lieu d'arrivée").build());
        }

        return Panache.withTransaction(() -> Profile.<Profile>findById(json.driver)
                .onItem().ifNotNull().transform(driver -> new Trajet(json.departureLoc, json.arrivalLoc,
                        json.departureTime, json.maxPassagers, driver))
                .onItem().ifNotNull().transformToUni(trajet -> trajet.<Trajet>persist())
                .onItem().ifNotNull().transform(trajet -> Response.ok(trajet).status(CREATED).build())
                .onItem().ifNull().continueWith(Response.ok(json).status(BAD_REQUEST).build()));
    }

    private static class CreateTrajetJson {
        public String departureLoc;
        public String arrivalLoc;
        public Date departureTime;
        public int maxPassagers;
        public String driver;
    }
}
