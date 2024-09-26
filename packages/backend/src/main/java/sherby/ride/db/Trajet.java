package sherby.ride.db;

import java.util.Date;
import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import io.smallrye.mutiny.Uni;
import jakarta.persistence.Cacheable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

@Entity
@Cacheable
public class Trajet extends PanacheEntity {

    @Column(length = 50)
    public String departureLoc;

    @Column(length = 50)
    public String arrivalLoc;

    @Column
    public Date departureTime;

    @Column
    public int maxPassagers;

    @ManyToOne
    public Profile profile;

    public Trajet() {
    }

    public Trajet(String departureLoc, String arrivalLoc, Date departureTime, int maxPassagers, Profile profile) {
        this.departureLoc = departureLoc;
        this.arrivalLoc = arrivalLoc;
        this.departureTime = departureTime;
        this.maxPassagers = maxPassagers;
        this.profile = profile;
    }

    public Uni<List<Trajet>> findBydepartureLoc(String departureLoc) {
        return list("departureLoc", departureLoc);
    }

    public Uni<List<Trajet>> findByarrivalLoc(String arrivalLoc) {
        return list("arrivalLoc", arrivalLoc);
    }

    public Uni<List<PanacheEntity>> findBydepartureTime(String departureTime) {
        return list("departureTime", departureTime);
    }
}
