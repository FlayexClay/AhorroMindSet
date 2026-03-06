package com.ahorrosMindset.mindset.Repository;

import com.ahorrosMindset.mindset.Entity.PlanAhorro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Month;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlanAhorroRepository extends JpaRepository<PlanAhorro, Long> {
    List<PlanAhorro> findByUsuarioId(Long usuarioId);
    Optional<PlanAhorro> findByIdAndUsuarioId(Long id, Long usuarioId);
    boolean existsByUsuarioIdAndMes(Long usuarioId, Month mes);
}
