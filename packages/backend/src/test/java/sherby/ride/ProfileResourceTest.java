package sherby.ride;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import io.quarkus.panache.mock.PanacheMock;
import io.quarkus.test.junit.QuarkusTest;
import io.smallrye.mutiny.Uni;
import sherby.ride.db.Profile;

@QuarkusTest
class ProfileResourceTest {
    @Test
    public void testProfil() {
        PanacheMock.mock(Profile.class);

        Profile p = new Profile();
        p.cip = "test1234";
        p.phone = "438-504-3225";
        p.faculty = "École de gestion";

        // Mock behavior
        Mockito.when(Profile.findById(p.cip)).thenReturn(Uni.createFrom().item(p));
        Mockito.when(Profile.findById("nono1212")).thenReturn(Uni.createFrom().nullItem());

        // Test successful find
        Uni<Profile> result = Profile.findById(p.cip);
        Assertions.assertNotNull(result);
        Assertions.assertEquals(p.cip, result.await().indefinitely().cip);

        // Test unsuccessful find
        Uni<Profile> nullResult = Profile.findById("nono1212");
        Assertions.assertNull(nullResult.await().indefinitely());
    }
}
