package sherby.ride.db;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Cacheable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;

@Entity
@Cacheable
public class Rating extends PanacheEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    public Profile evaluator;

    @ManyToOne(fetch = FetchType.LAZY)
    public Profile evaluated;

    @ManyToOne(fetch = FetchType.LAZY)
    public Trajet ride;

    @Column
    public float note;

    public Rating() {
    }

    public Rating(Profile evaluator, Profile evaluated, Trajet ride, float note) {
        this.evaluator = evaluator;
        this.evaluated = evaluated;
        this.ride = ride;
        this.note = note;
    }
}
