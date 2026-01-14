package org.example.fileextblocker.service;

import org.example.fileextblocker.dto.Responses;
import org.example.fileextblocker.entity.BlockedExtension;
import org.example.fileextblocker.entity.ExtensionType;
import org.example.fileextblocker.repository.BlockedExtensionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExtensionService {

    private static final int MAX_EXT_LEN = 20;
    private static final int MAX_CUSTOM = 200;

    private final BlockedExtensionRepository repo;

    public ExtensionService(BlockedExtensionRepository repo) {
        this.repo = repo;
    }

    public Responses.ExtensionsResponse getAll() {
        var fixed = repo.findAllByTypeOrderByExtAsc(ExtensionType.FIXED).stream()
                .map(e -> new Responses.FixedDto(e.getExt(), e.isBlocked()))
                .toList();

        var custom = repo.findAllByTypeOrderByExtAsc(ExtensionType.CUSTOM).stream()
                .map(BlockedExtension::getExt)
                .toList();

        return new Responses.ExtensionsResponse(fixed, custom);
    }

    @Transactional
    public void toggleFixed(String extRaw, boolean blocked) {
        String ext = normalize(extRaw);
        if (ext.isBlank()) throw new IllegalArgumentException("확장자가 비어있습니다.");

        BlockedExtension e = repo.findByExt(ext)
                .orElseGet(() -> BlockedExtension.fixed(ext, false));

        if (e.getType() != ExtensionType.FIXED) {
            throw new IllegalArgumentException("CUSTOM 확장자는 toggle 대상이 아닙니다.");
        }

        e.setBlocked(blocked);
        repo.save(e);
    }

    @Transactional
    public void addCustom(String extRaw) {
        String ext = normalize(extRaw);

        if (ext.isBlank()) throw new IllegalArgumentException("확장자를 입력하세요.");
        if (ext.length() > MAX_EXT_LEN) throw new IllegalArgumentException("확장자는 최대 20자입니다.");

        if (!ext.matches("^[a-z]+$")) { // normalize 후라면 소문자만 허용해도 됨
            throw new IllegalArgumentException("커스텀 확장자는 영문자만 입력 가능합니다.");
        }


        if (repo.existsByExt(ext)) {
            throw new IllegalStateException("이미 존재하는 확장자입니다.");
        }

        long count = repo.countByType(ExtensionType.CUSTOM);
        if (count >= MAX_CUSTOM) {
            throw new IllegalStateException("커스텀 확장자는 최대 200개까지 가능합니다.");
        }

        repo.save(BlockedExtension.custom(ext));
    }

    @Transactional
    public void deleteCustom(String extRaw) {
        String ext = normalize(extRaw);
        repo.deleteByExtAndType(ext, ExtensionType.CUSTOM);
    }

    public String normalize(String raw) {
        if (raw == null) return "";
        String s = raw.trim().toLowerCase();
        if (s.startsWith(".")) s = s.substring(1);
        return s;
    }
    @Transactional
    public void addFixed(String extRaw) {
        String ext = normalize(extRaw);

        if (ext.isBlank()) throw new IllegalArgumentException("확장자를 입력하세요.");
        if (ext.length() > 20) throw new IllegalArgumentException("확장자는 최대 20자입니다.");
        if (!ext.matches("^[a-z]+$")) throw new IllegalArgumentException("확장자는 영문자만 입력 가능합니다.");

        var existing = repo.findByExt(ext);
        if (existing.isPresent()) {
            if (existing.get().getType() == ExtensionType.CUSTOM) {
                throw new IllegalStateException("이미 커스텀 확장자로 존재합니다.");
            }
            throw new IllegalStateException("이미 고정 확장자로 존재합니다.");
        }

        repo.save(BlockedExtension.fixed(ext, false)); // 고정 확장자 default uncheck 유지 [file:1]
    }

    @Transactional
    public void deleteFixed(String extRaw) {
        String ext = normalize(extRaw);
        repo.deleteByExtAndType(ext, ExtensionType.FIXED);
    }

    @Transactional
    public void promoteCustomToFixed(String extRaw) {
        String ext = normalize(extRaw);

        var e = repo.findByExt(ext).orElseThrow(() ->
                new IllegalArgumentException("존재하지 않는 확장자입니다.")
        );

        if (e.getType() == ExtensionType.FIXED) {
            throw new IllegalStateException("이미 고정 확장자입니다.");
        }

        // CUSTOM -> FIXED 승격
        e.setType(ExtensionType.FIXED);
        e.setBlocked(false);
        repo.save(e);
    }



}
