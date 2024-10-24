package sherby.ride.api;

import static jakarta.ws.rs.core.Response.Status.CREATED;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.oidc.UserInfo;
import io.quarkus.security.Authenticated;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import sherby.ride.db.Car;
import sherby.ride.db.Profile;

@Path("/car")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CarResource {

    @Inject
    UserInfo userInfo;

    @GET
    public Uni<List<Car>> getCars() {
        return Profile.<Profile>findById(userInfo.getPreferredUserName()).onItem()
                .transformToUni(profile -> Car.list("owner", profile));
    }

    @GET
    @Path("/{plate}")
    public Uni<Car> getCar(@PathParam("plate") String licencePlate) {
        return Car.findById(licencePlate);
    }

    @POST
    public Uni<Response> createCar(CreateCarDOT json) {
        var cip = userInfo.getPreferredUserName();

        return Panache.withTransaction(() -> Profile.<Profile>findById(cip)
                .onItem()
                .transformToUni(owner -> new Car(json.licencePlate, json.type, json.model, json.year, json.color, owner)
                        .<Car>persist())
                .onItem().transform(car -> Response.ok(car).status(CREATED).build()));
    }

    // @PUT
    // public Uni<Response> updateCar(Car profile) {
    // if (!profile.cip.equals(userInfo.getPreferredUserName())) {
    // return Uni.createFrom().item(Response.status(UNAUTHORIZED).build());
    // }

    // if (profile.email == null || profile.email.isEmpty()) {
    // return Uni.createFrom().item(Response.status(BAD_REQUEST).build());
    // }

    // if (profile.phone == null || profile.phone.isEmpty()) {
    // return Uni.createFrom().item(Response.status(BAD_REQUEST).build());
    // }

    // if (profile.faculty == null || profile.faculty.isEmpty()) {
    // return Uni.createFrom().item(Response.status(BAD_REQUEST).build());
    // }

    // return Panache
    // .withTransaction(() -> Car.<Car>findById(profile.cip)
    // .onItem().ifNotNull()
    // .invoke(entity -> entity.updateCar(profile.email, profile.phone,
    // profile.faculty))
    // .onItem().ifNotNull().transform(entity -> Response.ok(entity).build())
    // .onItem().ifNull().continueWith(Response.status(NOT_FOUND)::build));
    // }

    private record CreateCarDOT(String licencePlate, String type, String model, int year, String color) {
    }
}
