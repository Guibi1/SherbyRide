package sherby.ride.api;

import static jakarta.ws.rs.core.Response.Status.BAD_REQUEST;
import static jakarta.ws.rs.core.Response.Status.CREATED;
import static jakarta.ws.rs.core.Response.Status.NOT_FOUND;
import static jakarta.ws.rs.core.Response.Status.UNAUTHORIZED;

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
import sherby.ride.db.Rating;
import sherby.ride.db.Trajet;

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
                .onItem().ifNull().continueWith(Response.status(NOT_FOUND)::build);
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
        if (!profile.cip.equals(userInfo.getPreferredUserName())) {
            return Uni.createFrom().item(Response.status(UNAUTHORIZED).build());
        }

        if (profile.email == null || profile.email.isEmpty()) {
            return Uni.createFrom().item(Response.status(BAD_REQUEST).build());
        }

        if (profile.phone == null || profile.phone.isEmpty()) {
            return Uni.createFrom().item(Response.status(BAD_REQUEST).build());
        }

        if (profile.faculty == null || profile.faculty.isEmpty()) {
            return Uni.createFrom().item(Response.status(BAD_REQUEST).build());
        }

        return Panache
                .withTransaction(() -> Profile.<Profile>findById(profile.cip)
                        .onItem().ifNotNull()
                        .invoke(entity -> entity.updateProfile(profile.email, profile.phone, profile.faculty))
                        .onItem().ifNotNull().transform(entity -> Response.ok(entity).build())
                        .onItem().ifNull().continueWith(Response.status(NOT_FOUND)::build));
    }

    @POST
    @Path("/{cip}/rating")
    public Uni<Response> createRating(@PathParam("cip") String cip, CreateRatingDOT json) {

        if (json.evaluator == null || json.evaluator.isEmpty()) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST).build());
        }

        if (json.evaluated == null || json.evaluated.isEmpty()) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST).build());
        }

        if (json.trajet == null || json.trajet.isEmpty()) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST).build());
        }

        if (json.note < 0 || json.note > 5) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST).build());
        }

        if (!json.evaluator.equals(userInfo.getPreferredUserName())) {
            return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST).build());
        }

        return Panache.withTransaction(() -> {
            var evaluatedUni = Profile.<Profile>findById(json.evaluated);
            var evaluatorUni = Profile.<Profile>findById(json.evaluator);
            var trajetUni = Trajet.<Trajet>findById(json.trajet);

            return Uni.combine().all().unis(evaluatedUni, evaluatorUni, trajetUni)
                    .withUni((evaluated, evaluator, trajet) -> new Rating(evaluator, evaluated, trajet, json.note)
                            .<Rating>persist())
                    .onItem().ifNotNull().transform(rating -> Response.ok(rating).status(CREATED).build())
                    .onItem().ifNull().continueWith(Response.status(BAD_REQUEST)::build);
        });
    }

    private record CreateRatingDOT(String evaluator, String evaluated, String trajet, float note) {
    }
}
