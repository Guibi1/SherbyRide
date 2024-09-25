package sherby.ride.db;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Cacheable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
@Cacheable
public class Profile extends PanacheEntityBase {

    @Id
    @Column(length = 8, unique = true)
    public String cip;

    public String name;

    public String email;

    public String phone;

    public String faculty;

    // Méthode pour mettre à jour un profil
    public void updateProfile(String email, String phone,  String faculty) {
        this.email = email;
        this.phone = phone;
        this.faculty = faculty;
        persist();
    }

}
