export type ExcelCellValue = string | number | boolean | null | undefined;

export interface ExcelTableColumn<Row> {
  header: string;
  value: (row: Row, index: number) => ExcelCellValue;
  type?: "text" | "number" | "currency";
  width?: number;
}

export interface BuildExcelTableWorkbookOptions<Row> {
  title: string;
  worksheetName?: string;
  columns: ExcelTableColumn<Row>[];
  rows: Row[];
}

const escapeXml = (value: ExcelCellValue) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const sanitizeWorksheetName = (value: string) =>
  value
    .replace(/[\\/*?:[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 31) || "Data";

const toCell = <Row>(
  column: ExcelTableColumn<Row>,
  row: Row,
  index: number,
) => {
  const value = column.value(row, index);
  if (column.type === "number" || column.type === "currency") {
    const numericValue = Number(value);
    const normalizedValue = Number.isFinite(numericValue) ? numericValue : 0;
    return `<Cell ss:StyleID="${column.type === "currency" ? "Currency" : "Number"}"><Data ss:Type="Number">${normalizedValue}</Data></Cell>`;
  }

  return `<Cell ss:StyleID="Text"><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
};

export function buildExcelTableWorkbook<Row>({
  title,
  worksheetName = "Data",
  columns,
  rows,
}: BuildExcelTableWorkbookOptions<Row>) {
  const columnDefinitions = columns
    .map(
      (column) =>
        `<Column ss:AutoFitWidth="0" ss:Width="${column.width ?? 120}"/>`,
    )
    .join("");
  const headerCells = columns
    .map(
      (column) =>
        `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(column.header)}</Data></Cell>`,
    )
    .join("");
  const bodyRows = rows
    .map(
      (row, index) =>
        `<Row>${columns.map((column) => toCell(column, row, index)).join("")}</Row>`,
    )
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Top"/><Font ss:FontName="Arial" ss:Size="10"/></Style>
  <Style ss:ID="Title"><Alignment ss:Vertical="Center"/><Font ss:FontName="Arial" ss:Size="14" ss:Bold="1"/></Style>
  <Style ss:ID="Header"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:FontName="Arial" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1D4ED8" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
  <Style ss:ID="Text"><Alignment ss:Vertical="Top" ss:WrapText="1"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/></Borders></Style>
  <Style ss:ID="Number"><Alignment ss:Horizontal="Right" ss:Vertical="Top"/><NumberFormat ss:Format="0"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/></Borders></Style>
  <Style ss:ID="Currency"><Alignment ss:Horizontal="Right" ss:Vertical="Top"/><NumberFormat ss:Format="&quot;Rp&quot; #,##0"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1D5DB"/></Borders></Style>
 </Styles>
 <Worksheet ss:Name="${escapeXml(sanitizeWorksheetName(worksheetName))}">
  <Table ss:ExpandedColumnCount="${columns.length}" ss:ExpandedRowCount="${rows.length + 2}" x:FullColumns="1" x:FullRows="1">
   ${columnDefinitions}
   <Row ss:Height="24"><Cell ss:StyleID="Title" ss:MergeAcross="${Math.max(columns.length - 1, 0)}"><Data ss:Type="String">${escapeXml(title)}</Data></Cell></Row>
   <Row ss:Height="30">${headerCells}</Row>
   ${bodyRows}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><FreezePanes/><FrozenNoSplit/><SplitHorizontal>2</SplitHorizontal><TopRowBottomPane>2</TopRowBottomPane><ProtectObjects>False</ProtectObjects><ProtectScenarios>False</ProtectScenarios></WorksheetOptions>
 </Worksheet>
</Workbook>`;
}
