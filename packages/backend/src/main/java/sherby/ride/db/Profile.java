package sherby.ride.db;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Cacheable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
@Cacheable
public class Profile extends PanacheEntityBase {

    @Id
    @Column(length = 8, unique = true)
    public String cip;

    @Column
    public String name;

    @Column
    public String email;

    @Column
    public String phone;

    @Column
    public String faculty;

    @JsonIgnore
    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Trajet> trajets;

    // Méthode pour mettre à jour un profil
    public void updateProfile(String email, String phone, String faculty) {
        this.email = email;
        this.phone = phone;
        this.faculty = faculty;
        persist();
    }
}
