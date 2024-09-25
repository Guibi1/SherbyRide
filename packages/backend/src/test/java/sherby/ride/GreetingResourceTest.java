package sherby.ride;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import io.quarkus.panache.mock.PanacheMock;
import io.quarkus.test.junit.QuarkusTest;
import io.smallrye.mutiny.Uni;
import sherby.ride.db.Profile;

@QuarkusTest
class GreetingResourceTest {
    @Test
    public void testProfil() {
        PanacheMock.mock(Profile.class);

        Profile p = new Profile();
        p.cip = "test1234";
        p.phone = "438-504-3225";
        p.faculty = "École de gestion";

        Mockito.when(Profile.findById(p.cip)).thenReturn(Uni.createFrom().item(p));
        Assertions.assertSame(Uni.createFrom().item(p), Profile.findById(p.cip));
        Assertions.assertNull(Profile.findById("nono1212"));
    }

}
