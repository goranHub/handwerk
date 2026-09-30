import { SalesDocument } from '../types/erp';

export function generateElectronicInvoiceXml(doc: SalesDocument, company: {
  companyName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  vatId?: string;
  iban?: string;
  bic?: string;
}): string {
  const esc = (str?: string) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const netTotal = doc.items.reduce((sum, item) => sum + (item.kind === 'Text' ? 0 : item.quantity * item.unitPrice), 0);
  const taxRate = doc.taxMode === 'Regelbesteuerung' ? doc.taxRate : 0;
  const taxTotal = (netTotal * taxRate) / 100;
  const grossTotal = netTotal + taxTotal + (doc.reminderFee || 0);

  const lines = doc.items
    .filter((item) => item.kind !== 'Text')
    .map(
      (item, idx) => `
    <LineItem>
      <LineNumber>${idx + 1}</LineNumber>
      <Name>${esc(item.title)}</Name>
      <Description>${esc(item.details)}</Description>
      <Quantity unitCode="${esc(item.unit)}">${item.quantity.toFixed(2)}</Quantity>
      <UnitPrice currency="EUR">${item.unitPrice.toFixed(2)}</UnitPrice>
      <LineExtensionAmount currency="EUR">${(item.quantity * item.unitPrice).toFixed(2)}</LineExtensionAmount>
    </LineItem>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>${esc(doc.electronicFormat || 'urn:cen.eu:en16931:2017#compliant#urn:xoev-de:kosit:standard:xrechnung_2.2')}</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${esc(doc.number)}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${doc.date.split('T')[0].replace(/-/g, '')}</udt:DateTimeString>
    </ram:IssueDateTime>
    <ram:Notes>${esc(doc.notes)}</ram:Notes>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
    <ram:ApplicableHeaderTradeAgreement>
      <ram:BuyerReference>${esc(doc.buyerReference || 'LEITWEG-ID-001')}</ram:BuyerReference>
      <ram:SellerTradeParty>
        <ram:Name>${esc(company.companyName)}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:LineOne>${esc(company.street)}</ram:LineOne>
          <ram:PostcodeCode>${esc(company.postalCode)}</ram:PostcodeCode>
          <ram:CityName>${esc(company.city)}</ram:CityName>
          <ram:CountryID>${esc(company.country || 'DE')}</ram:CountryID>
        </ram:PostalTradeAddress>
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${esc(company.vatId || 'DE000000000')}</ram:ID>
        </ram:SpecifiedTaxRegistration>
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${esc(doc.customerName)}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:LineOne>${esc(doc.customerAddress)}</ram:LineOne>
        </ram:PostalTradeAddress>
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradeSettlementPaymentMeans>
        <ram:TypeCode>58</ram:TypeCode>
        <ram:PayeePartyCreditorFinancialAccount>
          <ram:IBANID>${esc(company.iban?.replace(/\s+/g, ''))}</ram:IBANID>
        </ram:PayeePartyCreditorFinancialAccount>
        <ram:PayeeSpecifiedCreditorFinancialInstitution>
          <ram:BICID>${esc(company.bic?.replace(/\s+/g, ''))}</ram:BICID>
        </ram:PayeeSpecifiedCreditorFinancialInstitution>
      </ram:SpecifiedTradeSettlementPaymentMeans>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount currency="EUR">${netTotal.toFixed(2)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount currency="EUR">${netTotal.toFixed(2)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currency="EUR">${taxTotal.toFixed(2)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount currency="EUR">${grossTotal.toFixed(2)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount currency="EUR">${grossTotal.toFixed(2)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
    <ram:IncludedSupplyChainTradeLineItem>
      ${lines}
    </ram:IncludedSupplyChainTradeLineItem>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`.trim();
}

export function downloadXmlFile(xmlContent: string, filename: string): void {
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
