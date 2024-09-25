package sherby.ride.db;

import jakarta.persistence.Cacheable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;

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
    public void updateProfile(String phone) {
        this.phone = phone;
        persist();
    }

}
