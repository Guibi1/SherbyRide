package sherby.ride;

import io.quarkus.test.junit.QuarkusTest;
import sherby.ride.db.Profile;
import sherby.ride.db.Profile.Faculty;
//import io.quarkus.panache.mock.PanacheMock;

import org.junit.jupiter.api.Test;

/*import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;*/

@QuarkusTest
class GreetingResourceTest {
    @Test
    public void testProfil() {
        // PanacheMock.mock(Profile.class);

        Profile p = new Profile();
        p.cip = "labb1405";
        // p.dateDeNaissance = LocalDate.of(2004, 05, 07);
        p.phone = "438-504-3225";
        p.departement = Faculty.Informatique;

        p.findById(p.cip);
    }

}
