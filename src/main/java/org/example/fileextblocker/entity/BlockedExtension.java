package org.example.fileextblocker.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;


@Getter
@Entity
@Table(name = "blocked_extension",
        uniqueConstraints = @UniqueConstraint(name = "uk_ext", columnNames = "ext"))
public class BlockedExtension {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String ext; // normalized (lowercase, no dot)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Setter
    private ExtensionType type;

    @Column(nullable = false)
    private boolean blocked;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected BlockedExtension() {}

    public static BlockedExtension fixed(String ext, boolean blocked) {
        BlockedExtension e = new BlockedExtension();
        e.ext = ext;
        e.type = ExtensionType.FIXED;
        e.blocked = blocked;
        return e;
    }

    public static BlockedExtension custom(String ext) {
        BlockedExtension e = new BlockedExtension();
        e.ext = ext;
        e.type = ExtensionType.CUSTOM;
        e.blocked = true;
        return e;
    }

    public void setBlocked(boolean blocked) { this.blocked = blocked; }
}
