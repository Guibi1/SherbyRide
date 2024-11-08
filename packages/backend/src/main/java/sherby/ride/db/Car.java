package sherby.ride.db;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Cacheable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
@Cacheable
public class Car extends PanacheEntityBase {

    @Id
    @Column(length = 6, unique = true)
    public String licencePlate;

    @Column(length = 50)
    public String type;

    @Column(length = 50)
    public String model;

    @Column
    public int year;

    @Column(length = 50)
    public String color;

    @Column
    public boolean deleted;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    public Profile owner;

    public Car() {
    }

    public Car(String licencePlate, String type, String model, int year, String color, Profile owner) {
        this.licencePlate = licencePlate;
        this.type = type;
        this.model = model;
        this.year = year;
        this.color = color;
        this.owner = owner;
    }
}
