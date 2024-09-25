package sherby.ride;

import io.quarkus.oidc.UserInfo;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Authenticated
@Path("/hello")
public class GreetingResource {

    @Inject
    UserInfo userInfo;

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
        return "Hello from Quarkus REST" + userInfo.getEmail();
    }
}
