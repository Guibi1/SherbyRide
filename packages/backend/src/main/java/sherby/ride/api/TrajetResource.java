package sherby.ride.api;

import static jakarta.ws.rs.core.Response.Status.BAD_REQUEST;
import static jakarta.ws.rs.core.Response.Status.CREATED;

import java.util.Date;
import java.util.List;

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
    public Uni<List<GetRideDOT>> get() {
        return Trajet.<Trajet>listAll(Sort.by("departureTime")).onItem().transform(list -> list.stream()
                .map(trajet -> toRideDOT(trajet, trajet.driver.getRating()))
                .toList());
    }

    @GET
    @Path("{id}")
    public Uni<GetRideDOT> getSingle(Long id) {
        return Trajet.<Trajet>findById(id).onItem()
                .transform(trajet -> toRideDOT(trajet, trajet.driver.getRating()));
    }

    @POST
    @Authenticated
    public Uni<Response> create(PostRideDOT json) {

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
                () -> Profile.<Profile>findById(json.driver).onItem().ifNotNull().<Trajet>transformToUni(driver -> {
                    var trajet = new Trajet(json.departureLoc, json.arrivalLoc, json.departureTime, json.maxPassengers,
                            driver);
                    return trajet.persist();
                })
                        .onItem().ifNotNull().transform(trajet -> Response.ok(trajet).status(CREATED).build()))
                .onItem().ifNull().continueWith(Response.ok().status(BAD_REQUEST)::build);
    }

    private record GetRideDOT(
            Long id,
            String departureLoc,
            String arrivalLoc,
            Date departureTime,
            int maxPassengers,
            ProfileRatings ratings) {
    }

    static GetRideDOT toRideDOT(Trajet ride, ProfileRatings ratings) {
        return new GetRideDOT(ride.id, ride.departureLoc, ride.arrivalLoc,
                ride.departureTime,
                ride.maxPassengers, ratings);
    }

    public record PostRideDOT(String departureLoc, String arrivalLoc, Date departureTime, int maxPassengers,
            String driver) {
    }
}
