package sherby.ride.api;

import static jakarta.ws.rs.core.Response.Status.CREATED;

import java.util.List;

import io.quarkus.panache.common.Sort;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
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
    @Transactional
    public Uni<Response> create(Trajet trajet) {

        if (trajet.getDepartureLoc() == null || trajet.getDepartureLoc().isEmpty()) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST)
                    .entity("You must enter a departure location").build());
        }

        if (trajet.getArrivalLoc() == null || trajet.getArrivalLoc().isEmpty()) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST)
                    .entity("You must enter a arrival location").build());
        }

        if (trajet.getDepartureTime() == null) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST)
                    .entity("You must enter a arrival location").build());
        }

        return trajet.persist().replaceWith(Response.status(CREATED).entity(trajet).build());
    }

}
