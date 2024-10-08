package sherby.ride.api;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.core.Response;

import sherby.ride.db.Rating;

public class RatingRessource {

    @POST
    public Uni<Response> createRating(Rating cote) {
        if (cote != null) { // Ajouter des condition pour quan la note peut etre fait
            return Panache.withTransaction(cote::persist)
                    .replaceWith(Response.ok(cote).status(Response.Status.CREATED)::build);
        } else
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST).entity("Rating is null").build());
    }

}
