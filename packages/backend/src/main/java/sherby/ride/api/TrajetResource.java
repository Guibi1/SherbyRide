package sherby.ride.api;

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
import sherby.ride.db.Profile.ProfileRatings;
import sherby.ride.db.Trajet;

@Path("/trajet")
@ApplicationScoped
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)

public class TrajetResource {

    @GET
    public Uni<List<TrajetDOT>> get() {
        return Trajet.<Trajet>listAll(Sort.by("departureTime")).onItem().transform(list -> list.stream()
                .map(trajet -> new TrajetDOT(trajet.departureLoc, trajet.arrivalLoc, trajet.departureTime,
                        trajet.maxPassengers, trajet.driver.getRating()))
                .toList());
    }

    @GET
    @Path("{id}")
    public Uni<TrajetDOT> getSingle(Long id) {
        return Trajet.<Trajet>findById(id).onItem()
                .transform(trajet -> new TrajetDOT(trajet.departureLoc, trajet.arrivalLoc, trajet.departureTime,
                        trajet.maxPassengers, trajet.driver.getRating()));
    }

    @POST
    public Uni<Response> create(Trajet trajet) {

        if (trajet.departureLoc == null || trajet.departureLoc.isEmpty()) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST)
                    .entity("Vous devez entrer un lieu de départ").build());
        }

        if (trajet.arrivalLoc == null || trajet.arrivalLoc.isEmpty()) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST)
                    .entity("Vous devez entrer un lieu d'arrivée").build());
        }

        if (trajet.departureTime == null || trajet.departureTime.before(new Date())) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST)
                    .entity("Vous devez entrer un lieu d'arrivée").build());
        }

        return Panache.withTransaction(trajet::persist)
                .replaceWith(Response.ok(trajet).status(CREATED)::build);
    }

    public record TrajetDOT(String departureLoc, String arrivalLoc, Date departureTime, int maxPassagers,
            ProfileRatings ratings) {
    }
}
