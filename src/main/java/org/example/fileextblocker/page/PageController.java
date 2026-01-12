package org.example.fileextblocker.page;

import org.example.fileextblocker.service.ExtensionService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class PageController {

    private final ExtensionService service;

    public PageController(ExtensionService service) {
        this.service = service;
    }

    @GetMapping("/")
    public String extensionsPage(Model model) {
        var data = service.getAll();
        model.addAttribute("fixed", data.fixed());
        model.addAttribute("custom", data.custom()); // null 금지
        return "extensions"; // templates/extensions.html
    }
}