package com.ahorrosMindset.mindset.Repository;

import com.ahorrosMindset.mindset.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByCorreo(String correo);
    boolean existsByCorreo(String correo);
}
