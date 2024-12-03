package sherby.ride.db;

import java.util.Date;
import java.util.List;

import org.hibernate.reactive.mutiny.Mutiny;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import io.smallrye.mutiny.Uni;
import jakarta.persistence.Cacheable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

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
    @ManyToOne(fetch = FetchType.EAGER)
    public Profile driver;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    public Car car;

    @JsonIgnore
    @OneToMany(mappedBy = "ride", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<RidePassenger> passengers;

    @JsonIgnore
    @OneToMany(mappedBy = "ride", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Rating> ratings;

    @JsonIgnore
    public Uni<List<RidePassenger>> getCurrentPassengers() {
        return RidePassenger.<RidePassenger>list("ride.id = ?1 AND state != ?2", this.id, PassengerState.REFUSED);
    }

    @JsonIgnore
    public Uni<Long> getReservedSeats() {
        return RidePassenger.count("ride.id = ?1 AND state != ?2", this.id, PassengerState.REFUSED);
    }

    public Trajet() {
    }

    public Trajet(String departureLoc, String arrivalLoc, Date departureTime, int maxPassengers,
            List<RidePassenger> passengers,
            Profile driver, Car car) {
        this.departureLoc = departureLoc;
        this.arrivalLoc = arrivalLoc;
        this.departureTime = departureTime;
        this.maxPassengers = maxPassengers;
        this.driver = driver;
        this.passengers = passengers;
        this.car = car;
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

    public List<RidePassenger> getPassengers() {
        return passengers;
    }
}
