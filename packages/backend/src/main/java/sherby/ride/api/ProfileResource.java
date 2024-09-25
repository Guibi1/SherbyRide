package sherby.ride.api;

import static jakarta.ws.rs.core.Response.Status.CREATED;
import static jakarta.ws.rs.core.Response.Status.NOT_FOUND;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.oidc.UserInfo;
import io.quarkus.security.Authenticated;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import sherby.ride.db.Profile;

@Path("/profile")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProfileResource {

    @Inject
    UserInfo userInfo;

    // GET - Récupère un profil par CIP
    @GET
    @Path("/{cip}")
    public Uni<Profile> getProfile(@PathParam("cip") String cip) {
        return Profile.findById(cip);
    }

    // POST - Crée un nouveau profil
    @POST
    public Uni<Response> createProfile(Profile profile) {
        if (profile == null || profile.cip == userInfo.getSubject()) {
            throw new WebApplicationException("Bad request.", 422);
        }

        return Panache.withTransaction(profile::persist)
                .replaceWith(Response.ok(profile).status(CREATED)::build);
    }

    // PUT - Met à jour un profil existant
    @PUT
    @Path("/{cip}")
    public Uni<Response> updateProfile(@PathParam("cip") String cip, Profile profile) {
        if (profile == null || profile.phone == null) {
            throw new WebApplicationException("Profile phone was not set on request.", 422);
        }

        return Panache
                .withTransaction(() -> Profile.<Profile>findById(cip)
                        .onItem().ifNotNull().invoke(entity -> entity.updateProfile(profile.phone))
                        .onItem().ifNotNull().transform(entity -> Response.ok(entity).build())
                        .onItem().ifNull().continueWith(Response.ok().status(NOT_FOUND)::build));
    }
}