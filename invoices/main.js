const { createApp } = Vue
const { jsPDF } = jspdf;

createApp({
    data() {
        return {
            generalinfo: {
                companyname: "",
                contactname: "",
                biller: "",
                email: "",
                phone: "+61 ",
                watermark:"none",
                invoiceid: "",
                taxinc: true,
                taxtype: "GST",
                taxamount: "10",
                date: (new Date()).toISOString().split('T')[0],
                duedate: new Date((new Date()).setDate((new Date()).getDate() + 30)).toISOString().split('T')[0],
                notes: "Invoices paid after the due date may incur an additional fee up to 15%. Please contact the designated person(s) if you wish to request an extension to the listed due date.\n\nAll prices are listed in Australian Dollars (AUD) with GST Inc. unless otherwise specified."
            },
            paymentMethods: [
                {
                    type:"PayPal",
                    email: "",
                    bsb: "",
                    account: ""
                }
            ],
            invoiceitems: [
                {
                    qty: 1,
                    desc: '',
                    price: ''
                }
            ],
            addpayment(){
                this.paymentMethods.push({
                    type:"PayPal",
                    email: "",
                    bsb: "",
                    account: ""
                })
            },
            removepayment(index){
                this.paymentMethods.splice(index,1)
            },
            additem(){
                this.invoiceitems.push({
                    qty: 1,
                    desc: '',
                    price: ''
                })
            },
            removeitem(index){
                this.invoiceitems.splice(index,1)
            },
            datediff(){
                return Math.round((parseDate(this.generalinfo.duedate) - parseDate(this.generalinfo.date)) / (1000 * 60 * 60 * 24));
            },
            sum(list, property, multiplyer){
                total = 0
                list.forEach(element => {
                    var num = parseFloat(element[property]) * parseFloat(element[multiplyer])
                    if(parseFloat(element[property]) && parseFloat(element[multiplyer])){
                        total += num
                    }
                });
                return (Math.round(total * 100) / 100).toFixed(2)
            },
            tax(amount,taxamount){
                return (Math.round(amount * 100 + amount * taxamount) / 100).toFixed(2)
            },
            generatePDF(){
                const doc = new jsPDF();
                
                doc.setFontSize(50)
                doc.setFont("Helvetica", "bold")
                doc.text('INVOICE', doc.internal.pageSize.getWidth() / 2, 25, 'center')
                
                doc.setFontSize(12)
                doc.setFont("Helvetica", "bold")
                doc.text(this.generalinfo.companyname, 20, 45)
                doc.setFont("Helvetica", "normal")
                doc.text(this.generalinfo.contactname, 20, 52)
                doc.text(this.generalinfo.phone, 20, 57)
                doc.text(this.generalinfo.email, 20, 62)

                var runningY = 80
                doc.setFontSize(16)
                doc.setFont("Helvetica", "bold")
                doc.text("BILL TO", 20, runningY)
                doc.setFontSize(14)
                
                runningY += 8
                var first = true
                doc.text(this.generalinfo.biller.toUpperCase(), 20, runningY)
                doc.setFont("Helvetica", "normal")
                this.paymentMethods.forEach((paymentmethod) => {
                    runningY += 7
                    if(!first){
                        doc.setFont("Helvetica", "bold")
                        doc.setFontSize(10)
                        doc.text("OR", 20, runningY)
                        doc.setFont("Helvetica", "normal")
                        doc.setFontSize(14)
                        runningY += 7
                    }
                    first = false
                    if(paymentmethod.type=="PayPal"){
                        doc.text("PayPal: " + paymentmethod.email, 20, runningY)
                    }
                    if(paymentmethod.type=="BSBAcc"){
                        doc.text("BSB: " + paymentmethod.bsb, 20, runningY)
                        runningY+=7
                        doc.text("Acc: " + paymentmethod.account, 20, runningY)
                    }
                })

                var leftColumnY = runningY

                runningY = 80
                doc.setFontSize(16)

                doc.setFont("Helvetica", "bold")
                doc.text("INVOICE #", doc.internal.pageSize.getWidth() / 2, runningY)
                doc.setFont("Helvetica", "normal")
                doc.text(this.generalinfo.invoiceid.toString(),doc.internal.pageSize.getWidth()-20, runningY, "right")
                runningY += 10
                doc.setFont("Helvetica", "bold")
                doc.text("INVOICE DATE", doc.internal.pageSize.getWidth() / 2, runningY)
                doc.setFont("Helvetica", "normal")
                doc.text(this.generalinfo.date.toString(),doc.internal.pageSize.getWidth()-20, runningY, "right")
                runningY += 10
                doc.setFont("Helvetica", "bold")
                doc.text("DUE DATE", doc.internal.pageSize.getWidth() / 2, runningY)
                doc.setFont("Helvetica", "normal")
                doc.text(this.generalinfo.duedate.toString(),doc.internal.pageSize.getWidth()-20, runningY, "right")
                
                runningY = Math.max(leftColumnY+7,runningY+10) //Make sure the new runningY takes into account the Y of each column (whichever is biggest)
                
                doc.line(18, runningY, doc.internal.pageSize.getWidth()-18, runningY)
                doc.setFontSize(16)
                doc.setFont("Helvetica", "bold")
                runningY+=7
                doc.text("QTY", 20, runningY)
                doc.text("DESCRIPTION", 40, runningY)
                doc.text("UNIT PRICE", doc.internal.pageSize.getWidth()-83, runningY)
                doc.text("AMOUNT", doc.internal.pageSize.getWidth()-45, runningY)

                runningY+=3
                doc.line(18, runningY, doc.internal.pageSize.getWidth()-18, runningY)
                runningY+=7
                doc.setFont("Helvetica", "normal")

                var runningTotal = 0

                this.invoiceitems.forEach((item) => {
                    doc.text(item.qty.toString(), 20, runningY)
                    doc.text(item.desc, 40, runningY)
                    doc.text((Math.round(item.price * 100) / 100).toFixed(2), doc.internal.pageSize.getWidth()-83, runningY)
                    doc.text((Math.round(item.price * item.qty * 100) / 100).toFixed(2), doc.internal.pageSize.getWidth()-45, runningY)

                    runningTotal+=Math.round(item.price * item.qty * 100) / 100

                    runningY+=10
                })

                runningY-=7
                doc.line(18, runningY, doc.internal.pageSize.getWidth()-18, runningY)
                runningY+=7

                doc.text("Subtotal", doc.internal.pageSize.getWidth()-83, runningY)
                doc.text(runningTotal.toFixed(2), doc.internal.pageSize.getWidth()-45, runningY)
                runningY+=10

                var taxed = this.generalinfo.taxinc ? 0 : runningTotal*this.generalinfo.taxamount/100

                if(this.generalinfo.taxinc){
                    doc.text("GST Inc.", doc.internal.pageSize.getWidth()-83, runningY)
                }else{
                    doc.text(this.generalinfo.taxtype, doc.internal.pageSize.getWidth()-83, runningY)
                    doc.text(taxed.toFixed(2), doc.internal.pageSize.getWidth()-45, runningY)
                }

                runningY+=10
                doc.setFont("Helvetica", "bold")
                doc.text("TOTAL", doc.internal.pageSize.getWidth()-83, runningY)
                doc.text((Math.round((runningTotal+taxed)*100)/100).toFixed(2), doc.internal.pageSize.getWidth()-45, runningY)




                
                doc.save(this.generalinfo.date+" INVOICE "+this.generalinfo.invoiceid+".pdf");                
                doc.output('datauri')
            }
        }
    },
    computed: {
        
    }
}).mount('#vuemount')

function parseDate(str) {
    var ymd = str.split('-');
    return new Date(ymd[0], ymd[1] - 1, ymd[2]);
}