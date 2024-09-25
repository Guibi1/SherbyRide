package sherby.ride.api;

import static jakarta.ws.rs.core.Response.Status.CREATED;
import static jakarta.ws.rs.core.Response.Status.NOT_FOUND;
import static jakarta.ws.rs.core.Response.Status.NO_CONTENT;

import java.util.List;

import io.quarkus.panache.common.Sort;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.ValidationMode;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import sherby.ride.db.Trajet;

@Path("trajet")
@ApplicationScoped
@Produces("application/json")
@Consumes("application/json")

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

    @Transactional
    public void create(Trajet trajet) {
        ValidationMode.notblank(Trajet.getDepartureLoc, "You must enter a departure location");
    }
}
