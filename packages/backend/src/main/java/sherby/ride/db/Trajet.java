package sherby.ride.db;

import jakarta.persistence.Cacheable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import io.smallrye.mutiny.Uni;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.util.Date;
import java.util.List;

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
    public Profile profile; // voir Profil ben

    // Methods

    public Trajet() {
    }

    public String getDepartureLoc() {
        return departureLoc;
    }

    public void setDepartureLoc(String loc) {
        this.departureLoc = loc;;
    }

    public String getArrivalLoc() {
        return arrivalLoc;
    }

    public void setArrivalLoc(String loc) {
        this.arrivalLoc = loc;;
    }

    public Date getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(Date date) {
        this.departureTime = date;
    }

    public int getMaxPassengers() {
        return maxPassagers;
    }

    public void setMaxPassengers(int nbPassengers) {
        this.maxPassagers = nbPassengers;
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

    //...

    public Trajet(int publication_id, String departureLoc, String arrivalLoc, Date departureTime, int maxPassagers, Profile profile) {
        //this.publication_id = publication_id;
        this.departureLoc = departureLoc;
        this.arrivalLoc = arrivalLoc;
        this.departureTime = departureTime;
        this.maxPassagers = maxPassagers;
        this.profile = profile;
    }
}

