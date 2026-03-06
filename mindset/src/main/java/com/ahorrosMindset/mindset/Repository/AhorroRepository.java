package com.ahorrosMindset.mindset.Repository;

import com.ahorrosMindset.mindset.Entity.Ahorro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface AhorroRepository extends JpaRepository<Ahorro, Long> {
    List<Ahorro> findByPlanAhorroId(Long planAhorroId);

    @Query("""
          SELECT COALESCE(SUM(a.monto), 0)
          FROM Ahorro a
          WHERE a.planAhorro.id = :planId
      """)
    BigDecimal sumMontoByPlanAhorroId(@Param("planId") Long planId);
}
