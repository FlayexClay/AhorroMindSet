package com.ahorrosMindset.mindset.Service.email;

import com.ahorrosMindset.mindset.Entity.Ahorro;
import com.ahorrosMindset.mindset.Entity.PlanAhorro;
import com.ahorrosMindset.mindset.Entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    private static final Map<String, String> MESES_ES = Map.ofEntries(
            Map.entry("JANUARY", "Enero"), Map.entry("FEBRUARY", "Febrero"),
            Map.entry("MARCH", "Marzo"), Map.entry("APRIL", "Abril"),
            Map.entry("MAY", "Mayo"), Map.entry("JUNE", "Junio"),
            Map.entry("JULY", "Julio"), Map.entry("AUGUST", "Agosto"),
            Map.entry("SEPTEMBER", "Septiembre"), Map.entry("OCTOBER", "Octubre"),
            Map.entry("NOVEMBER", "Noviembre"), Map.entry("DECEMBER", "Diciembre")
    );

    private static final Map<String, String> SIMBOLOS = Map.of(
            "PEN", "S/.", "USD", "$", "EUR", "€"
    );

    @Async
    public void enviarConfirmacionAhorro(User usuario, Ahorro ahorro, PlanAhorro plan) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setTo(usuario.getCorreo());
            helper.setSubject("💰 Ahorro registrado — AhorroMindSet");
            helper.setText(buildHtml(usuario, ahorro, plan), true);

            mailSender.send(mensaje);
            log.info("Correo enviado a {}", usuario.getCorreo());

        } catch (MessagingException e) {
            log.error("Error enviando correo a {}: {}", usuario.getCorreo(), e.getMessage());
        }
    }

    private String buildHtml(User usuario, Ahorro ahorro, PlanAhorro plan) {
        String mes      = MESES_ES.getOrDefault(plan.getMes().name(), plan.getMes().name());
        String simbolo  = SIMBOLOS.getOrDefault(plan.getTipoMoneda().name(), "S/.");
        String monto    = simbolo + " " + ahorro.getMonto().setScale(2, java.math.RoundingMode.HALF_UP);
        String meta     = simbolo + " " + plan.getMetaMensual().setScale(2, java.math.RoundingMode.HALF_UP);
        String recaudado= simbolo + " " + plan.getMontoRecibido().setScale(2, java.math.RoundingMode.HALF_UP);
        String faltante = simbolo + " " + plan.getMetaRestante().setScale(2, java.math.RoundingMode.HALF_UP);
        String fecha    = ahorro.getFecha().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        int progreso    = plan.getMetaMensual().compareTo(BigDecimal.ZERO) > 0
                ? plan.getMontoRecibido().multiply(BigDecimal.valueOf(100))
                .divide(plan.getMetaMensual(), 0, java.math.RoundingMode.HALF_UP).intValue()
                : 0;
        progreso = Math.min(progreso, 100);

        String badgeColor  = plan.isMetaAlcanzada() ? "#22c55e" : "#f59e0b";
        String badgeText   = plan.isMetaAlcanzada() ? "✅ ¡Meta alcanzada!" : "En curso";

        return """
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Ahorro Registrado</title>
            </head>
            <body style="margin:0;padding:0;background:#0a0f1a;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#0a0f1a;padding:40px 20px;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%%;">

                    <!-- Header -->
                    <tr><td style="background:linear-gradient(135deg,#0d2818,#0a1f12);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;border:1px solid rgba(34,197,94,0.2);border-bottom:none;">
                      <div style="font-size:36px;margin-bottom:8px;">💰</div>
                      <h1 style="margin:0;color:#22c55e;font-size:26px;font-weight:800;letter-spacing:-0.5px;">AhorroMindSet</h1>
                      <p style="margin:8px 0 0;color:rgba(255,255,255,0.5);font-size:14px;">Confirmación de ahorro registrado</p>
                    </td></tr>

                    <!-- Body -->
                    <tr><td style="background:#0d1a10;padding:36px 40px;border:1px solid rgba(34,197,94,0.15);border-top:none;border-bottom:none;">

                      <!-- Greeting -->
                      <p style="color:rgba(255,255,255,0.9);font-size:16px;margin:0 0 24px;">
                        Hola, <strong style="color:#22c55e;">%s %s</strong> 👋
                      </p>
                      <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 28px;line-height:1.6;">
                        Tu ahorro del <strong style="color:white;">%s</strong> ha sido registrado exitosamente.
                      </p>

                      <!-- Monto destacado -->
                      <div style="background:linear-gradient(135deg,rgba(34,197,94,0.18),rgba(34,197,94,0.06));border:1px solid rgba(34,197,94,0.35);border-radius:14px;padding:28px;text-align:center;margin-bottom:28px;">
                        <p style="margin:0 0 6px;color:rgba(34,197,94,0.7);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Monto ahorrado</p>
                        <p style="margin:0;color:#22c55e;font-size:42px;font-weight:800;letter-spacing:-1px;">%s</p>
                        <span style="display:inline-block;margin-top:12px;background:%s;color:#000;font-size:11px;font-weight:700;padding:4px 14px;border-radius:20px;">%s</span>
                      </div>

                      <!-- Stats grid -->
                      <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                        <tr>
                          <td width="50%%" style="padding-right:8px;">
                            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px 20px;">
                              <p style="margin:0 0 5px;color:rgba(255,255,255,0.35);font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Plan</p>
                              <p style="margin:0;color:white;font-size:16px;font-weight:700;">%s</p>
                            </div>
                          </td>
                          <td width="50%%" style="padding-left:8px;">
                            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px 20px;">
                              <p style="margin:0 0 5px;color:rgba(255,255,255,0.35);font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Meta mensual</p>
                              <p style="margin:0;color:white;font-size:16px;font-weight:700;">%s</p>
                            </div>
                          </td>
                        </tr>
                        <tr><td colspan="2" style="padding-top:12px;">
                          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px 20px;">
                            <table width="100%%"><tr>
                              <td>
                                <p style="margin:0 0 5px;color:rgba(255,255,255,0.35);font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Total recaudado</p>
                                <p style="margin:0;color:#22c55e;font-size:16px;font-weight:700;">%s</p>
                              </td>
                              <td align="right">
                                <p style="margin:0 0 5px;color:rgba(255,255,255,0.35);font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Faltante</p>
                                <p style="margin:0;color:rgba(255,255,255,0.6);font-size:16px;font-weight:700;">%s</p>
                              </td>
                            </tr></table>
                          </div>
                        </td></tr>
                      </table>

                      <!-- Progress bar -->
                      <div style="margin-bottom:32px;">
                        <table width="100%%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                          <tr>
                            <td style="color:rgba(255,255,255,0.4);font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Progreso del mes</td>
                            <td align="right" style="color:#22c55e;font-size:13px;font-weight:700;">%d%%</td>
                          </tr>
                        </table>
                        <div style="background:rgba(255,255,255,0.08);border-radius:6px;height:8px;overflow:hidden;">
                          <div style="background:linear-gradient(90deg,#22c55e,#4ade80);height:100%%;width:%d%%;border-radius:6px;"></div>
                        </div>
                      </div>

                      <p style="color:rgba(255,255,255,0.4);font-size:13px;line-height:1.6;margin:0;">
                        Sigue así 🚀 Cada ahorro te acerca más a tu meta. Puedes revisar tu historial completo en la sección <strong style="color:rgba(255,255,255,0.6);">Fechas</strong> de tu dashboard.
                      </p>

                    </td></tr>

                    <!-- Footer -->
                    <tr><td style="background:#080e18;border:1px solid rgba(34,197,94,0.1);border-top:1px solid rgba(34,197,94,0.15);border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
                      <p style="margin:0 0 6px;color:rgba(255,255,255,0.2);font-size:11px;letter-spacing:2px;text-transform:uppercase;">FLAYEXCLAY © — AHORRO MINDSET</p>
                      <p style="margin:0;color:rgba(255,255,255,0.15);font-size:11px;">Este correo fue enviado a %s</p>
                    </td></tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                usuario.getNombre(), usuario.getApellidos(),
                fecha,
                monto,
                badgeColor, badgeText,
                mes, meta,
                recaudado, faltante,
                progreso, progreso,
                usuario.getCorreo()
        );
    }
}





