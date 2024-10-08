package sherby.ride.db;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.inject.Inject;
import jakarta.persistence.Cacheable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Transient;

@Entity
@Cacheable
public class Profile extends PanacheEntityBase {

    @Transient
    @Inject
    EntityManager em;

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
    @OneToMany(mappedBy = "evaluated", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    public List<Rating> ratings = new ArrayList<>();

    // Méthode pour mettre à jour un profil
    public void updateProfile(String email, String phone, String faculty) {
        this.email = email;
        this.phone = phone;
        this.faculty = faculty;
        persist();
    }

    public ProfileRatings getRating() {
        return new ProfileRatings((float) ratings.stream().mapToDouble(r -> r.note).average().orElse(0),
                ratings.size());
    }

    public record ProfileRatings(Float average, Integer count) {
    }
}
