package org.example.fileextblocker.repository;

import org.example.fileextblocker.entity.BlockedExtension;
import org.example.fileextblocker.entity.ExtensionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BlockedExtensionRepository extends JpaRepository<BlockedExtension, Long> {
    Optional<BlockedExtension> findByExt(String ext);
    boolean existsByExt(String ext);

    List<BlockedExtension> findAllByTypeOrderByExtAsc(ExtensionType type);
    long countByType(ExtensionType type);

    void deleteByExtAndType(String ext, ExtensionType type);
}
