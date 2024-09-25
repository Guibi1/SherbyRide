package sherby.ride.api;

import static jakarta.ws.rs.core.Response.Status.CREATED;
import static jakarta.ws.rs.core.Response.Status.NOT_FOUND;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.oidc.UserInfo;
import io.quarkus.security.Authenticated;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.WebApplicationException;
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

    @GET
    public Uni<Response> getCurrentProfile() {
        return Profile.findById(userInfo.getPreferredUserName())
                .onItem().ifNotNull().transform(p -> Response.ok(p).build())
                .onItem().ifNull().continueWith(Response.ok().status(NOT_FOUND)::build);
    }

    @GET
    @Path("/{cip}")
    public Uni<Profile> getProfile(@PathParam("cip") String cip) {
        return Profile.findById(cip);
    }

    @POST
    public Uni<Response> createProfile(Profile profile) {
        if (profile == null || !profile.cip.equals(userInfo.getPreferredUserName())) {
            throw new WebApplicationException("Bad request." + userInfo.getPreferredUserName() + profile.cip, 422);
        }

        return Panache.withTransaction(profile::persist)
                .replaceWith(Response.ok(profile).status(CREATED)::build);
    }

    @PUT
    public Uni<Response> updateProfile(Profile profile) {
        if (profile == null || profile.phone == null) {
            throw new WebApplicationException("Profile phone was not set on request.", 422);
        }

        return Panache
                .withTransaction(() -> Profile.<Profile>findById(userInfo.getPreferredUserName())
                        .onItem().ifNotNull()
                        .invoke(entity -> entity.updateProfile(profile.email, profile.phone, profile.faculty))
                        .onItem().ifNotNull().transform(entity -> Response.ok(entity).build())
                        .onItem().ifNull().continueWith(Response.ok().status(NOT_FOUND)::build));
    }
}
