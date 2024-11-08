package sherby.ride.api;

import static jakarta.ws.rs.core.Response.Status.CREATED;
import static jakarta.ws.rs.core.Response.Status.FORBIDDEN;

import java.util.List;

import org.hibernate.reactive.mutiny.Mutiny;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.oidc.UserInfo;
import io.quarkus.security.Authenticated;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
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
                .transformToUni(profile -> Car.list("owner = ?1 and deleted = false", profile));
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

    @GET
    @Path("/{plate}")
    public Uni<Car> getCar(@PathParam("plate") String licencePlate) {
        return Car.findById(licencePlate);
    }

    @DELETE
    @Path("/{plate}")
    public Uni<Response> deleteCar(@PathParam("plate") String licencePlate) {
        return Panache.withTransaction(() -> Car.<Car>findById(licencePlate)
                .onItem().transformToUni(car -> Mutiny.fetch(car.owner)
                        .onItem().ifNotNull().transformToUni(owner -> {
                            if (!owner.cip.equals(userInfo.getPreferredUserName()))
                                return Uni.createFrom().nullItem();

                            car.deleted = true;
                            return car.<Car>persist();
                        }))
                .onItem().ifNotNull().transform((c) -> Response.ok(c).status(CREATED).build())
                .onItem().ifNull().continueWith(Response.ok().status(FORBIDDEN)::build));
    }

    private record CreateCarDOT(String licencePlate, String type, String model, int year, String color) {
    }
}
