package sherby.ride.db;

import java.util.List;

import org.hibernate.reactive.mutiny.Mutiny;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import io.smallrye.mutiny.Uni;
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
    public List<Trajet> rides;

    @JsonIgnore
    @OneToMany(mappedBy = "evaluated", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Rating> ratings;

    @JsonIgnore
    public Uni<ProfileRatings> getRatings() {
        return Mutiny.fetch(ratings).onItem().transform(
                ratings -> new ProfileRatings((float) ratings.stream().mapToDouble(r -> r.note).average().orElse(0),
                        ratings.size()));
    }

    public Uni<Profile> updateProfile(String email, String phone, String faculty) {
        this.email = email;
        this.phone = phone;
        this.faculty = faculty;
        return persist();
    }

    public record ProfileRatings(Float average, Integer count) {
    }
}
