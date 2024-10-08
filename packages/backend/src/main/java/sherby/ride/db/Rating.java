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
    public Trajet trajet;

    @Column
    public float note;
}
