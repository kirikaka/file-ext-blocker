package org.example.fileextblocker.api;

import jakarta.validation.Valid;
import org.example.fileextblocker.dto.Requests;
import org.example.fileextblocker.dto.Responses;
import org.example.fileextblocker.service.ExtensionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/extensions")
public class ExtensionApiController {

    private final ExtensionService service;

    public ExtensionApiController(ExtensionService service) {
        this.service = service;
    }

    @GetMapping
    public Responses.ExtensionsResponse getAll() {
        return service.getAll();
    }

    @PutMapping("/fixed/{ext}")
    public ResponseEntity<Void> toggleFixed(@PathVariable String ext,
                                            @RequestBody Requests.ToggleFixedRequest req) {
        service.toggleFixed(ext, req.blocked());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/custom")
    public ResponseEntity<Void> addCustom(@Valid @RequestBody Requests.AddCustomRequest req) {
        service.addCustom(req.ext());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/custom/{ext}")
    public ResponseEntity<Void> deleteCustom(@PathVariable String ext) {
        service.deleteCustom(ext);
        return ResponseEntity.noContent().build();
    }
}