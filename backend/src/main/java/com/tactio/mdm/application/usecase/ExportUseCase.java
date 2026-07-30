package com.tactio.mdm.application.usecase;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.tactio.mdm.application.dto.audit.AuditLogResponse;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportUseCase {

    private static final String[] HEADERS = {
            "Data/Hora", "Usuário", "Ação", "Entidade", "ID da Entidade", "IP", "Detalhes"
    };
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_INSTANT;

    public byte[] auditLogsToPdf(List<AuditLogResponse> logs) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfDocument pdfDocument = new PdfDocument(new PdfWriter(out));
            Document document = new Document(pdfDocument);

            document.add(new Paragraph("Argus MDM - Relatório de Logs de Auditoria").setBold().setFontSize(16));
            document.add(new Paragraph("Total de registros: " + logs.size()).setFontSize(10));

            Table table = new Table(UnitValue.createPercentArray(HEADERS.length)).useAllAvailableWidth();
            for (String header : HEADERS) {
                table.addHeaderCell(new Cell().add(new Paragraph(header).setBold()));
            }
            for (AuditLogResponse log : logs) {
                table.addCell(cell(FORMATTER.format(log.createdAt())));
                table.addCell(cell(log.userName()));
                table.addCell(cell(log.action() != null ? log.action().name() : ""));
                table.addCell(cell(log.entityType()));
                table.addCell(cell(log.entityId()));
                table.addCell(cell(log.ipAddress()));
                table.addCell(cell(log.details()));
            }
            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    public byte[] auditLogsToExcel(List<AuditLogResponse> logs) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Logs de Auditoria");

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                headerRow.createCell(i).setCellValue(HEADERS[i]);
            }

            int rowIndex = 1;
            for (AuditLogResponse log : logs) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(log.createdAt() != null ? FORMATTER.format(log.createdAt()) : "");
                row.createCell(1).setCellValue(nullToEmpty(log.userName()));
                row.createCell(2).setCellValue(log.action() != null ? log.action().name() : "");
                row.createCell(3).setCellValue(nullToEmpty(log.entityType()));
                row.createCell(4).setCellValue(nullToEmpty(log.entityId()));
                row.createCell(5).setCellValue(nullToEmpty(log.ipAddress()));
                row.createCell(6).setCellValue(nullToEmpty(log.details()));
            }

            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private Cell cell(String value) {
        return new Cell().add(new Paragraph(nullToEmpty(value)));
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
