package sherby.ride.db;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import io.smallrye.mutiny.Uni;
import jakarta.persistence.Cacheable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
    public int maxPassengers;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    public Profile driver;

    public Trajet() {
    }

    public Trajet(String departureLoc, String arrivalLoc, Date departureTime, int maxPassengers, Profile driver) {
        this.departureLoc = departureLoc;
        this.arrivalLoc = arrivalLoc;
        this.departureTime = departureTime;
        this.maxPassengers = maxPassengers;
        this.driver = driver;
    }

    public Uni<List<Trajet>> findBydepartureLoc(String departureLoc) {
        return list("departureLoc", departureLoc);
    }

    public Uni<List<Trajet>> findByarrivalLoc(String arrivalLoc) {
        return list("arrivalLoc", arrivalLoc);
    }

    public Uni<List<Trajet>> findBydepartureTime(String departureTime) {
        return list("departureTime", departureTime);
    }
}
