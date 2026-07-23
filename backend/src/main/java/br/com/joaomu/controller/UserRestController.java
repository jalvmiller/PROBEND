package br.com.joaomu.controller;

import br.com.joaomu.entity.User;
import br.com.joaomu.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin("*")
public class UserRestController extends BaseRestController<User, Long> {

    public UserRestController(UserService userService) {
        super(userService);
    }
}
