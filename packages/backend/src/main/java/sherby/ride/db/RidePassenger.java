package sherby.ride.db;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Cacheable;
import jakarta.persistence.Column;

import jakarta.persistence.ManyToOne;
import jakarta.persistence.Entity;

@Entity
@Cacheable
public class RidePassenger extends PanacheEntity {

    @ManyToOne
    public Trajet ride;

    @ManyToOne
    public Profile passenger;

    @Column
    public PassengerState state;

    public RidePassenger() {
    }

    public RidePassenger(Trajet ride, Profile passenger, PassengerState state) {
        this.ride = ride;
        this.passenger = passenger;
        this.state = state;
    }

    public Profile getPassenger() {
        return passenger;
    }
}
