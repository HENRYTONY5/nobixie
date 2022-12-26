function editarWebsite() {
  $.ajax({
    type: "POST",
    url: "ventasModelo.php?option=editarWebsite",
    dataType: "json",
    data: $(this).serialize(),
    success: function (respuesta) {
      if (respuesta.exito == 1) {
        window.location.href = "../../site/a/" + respuesta.apodo + "/index.php";
      }
      if (respuesta.exito == "1eng") {
        window.location.href = "../../site/a/" + respuesta.apodo + "/index.php";
      }
    },
  });
}

function irAlWebsite() {
  $.ajax({
    type: "POST",
    url: "ventasModelo.php?option=irAlWebsite",
    dataType: "json",
    data: $(this).serialize(),
    success: function (respuesta) {
      if (respuesta.exito == 1) {
        window.location.href =
          "../../site/a/" + respuesta.apodo + "/index.html";
      }
      if (respuesta.exito == "1eng") {
        window.location.href =
          "../../site/a/" + respuesta.apodo + "/index.html";
      }
    },
  });
}

function Consultar(id) {
  $.ajax({
    type: "POST",
    url: "ventasModelo.php?option=modificarConsultar&id=" + id,
    dataType: "json",
    data: $(this).serialize(),
    success: function (respuesta) {
      if (respuesta.error == 1) {
        swal(
          "Houston, tenemos un problema",
          "Esta venta fue eliminada!",
          "error"
        );
      }
      if (respuesta.error == "1eng") {
        swal(
          "Houston, we have a problem",
          "This sale was eliminated!",
          "error"
        );
      }
      if (respuesta.error == 2) {
        swal(
          "Houston, tenemos un problema",
          "Esta venta no fue encontrada!",
          "error"
        );
      }
      if (respuesta.error == "2eng") {
        swal("Houston, we have a problem", "This sale was not found!", "error");
      }
      if (respuesta.error == 3) {
        swal(
          "Houston, tenemos un problema",
          "Debe completar todos los datos!",
          "error"
        );
      }
      if (respuesta.error == "3eng") {
        swal(
          "Houston, we have a problem",
          "You must complete all the data!",
          "error"
        );
      }

      if (respuesta[0]["exito"] == 1) {
        jQuery(".divContenido").remove();
        jQuery(".divTotal").remove();
        var longitudArreglo = respuesta.length;
        document.querySelector("#titleModal").innerHTML = "Detalle de la venta";
        document
          .querySelector(".modal-header")
          .classList.replace("headerRegister", "headerUpdate");
        document
          .querySelector("#btnActionForm")
          .classList.replace("btn-primary", "btn-info");
        $("button.website").hide();

        var i = 0;
        var total = 0;
        var contentTotal = "<tr>";
        var content = "";
        var idEmpresa = "";
        for (i = 0; i < longitudArreglo; i++) {
          idEmpresa = respuesta[i]["idEmpresa"];

          var imagen =
            "../../site/a/" +
            idEmpresa +
            "/productos/" +
            respuesta[i]["imagen"];
          content +=
            '<tr><tr class="divContenido"><td width="20%">' +
            respuesta[i]["nombre"] +
            '</td><td width="25%">' +
            '<img src="' +
            imagen +
            '" height="140px";>' +
            '</td><td width="10%" class="text-center">' +
            respuesta[i]["cantidad"] +
            '</td><td width="20%" class="text-center">' +
            "$" +
            respuesta[i]["preciounitario"] +
            '</td><td width="20%" class="text-center">' +
            "$" +
            (respuesta[i]["cantidad"] * respuesta[i]["preciounitario"]).toFixed(
              2
            ) +
            "</td></tr>";
          total =
            total + respuesta[i]["cantidad"] * respuesta[i]["preciounitario"];
        }
        content += "</tr>";
        contentTotal =
          '<tr class="divTotal"><td colspan="4" align="right"><h3>' +
          "Total" +
          "</h3></td>";
        contentTotal +=
          '<td align="right"><h3>' + "$" + total.toFixed(2) + "</h3></td></tr>";

        $("#tablaVenta").append(content);
        $("#tablaVenta").append(contentTotal);
        $("#tablaVenta").show();
        $("#modal-default").modal("show");
      }

      if (respuesta[0]["exito"] == "1eng") {
        jQuery(".divContenido").remove();
        jQuery(".divTotal").remove();
        var longitudArreglo = respuesta.length;
        document.querySelector("#titleModal").innerHTML = "Sale detail";
        document
          .querySelector(".modal-header")
          .classList.replace("headerRegister", "headerUpdate");
        document
          .querySelector("#btnActionForm")
          .classList.replace("btn-primary", "btn-info");
        $("button.website").hide();

        var i = 0;
        var total = 0;
        var contentTotal = "<tr>";
        var content = "";
        var idEmpresa = "";
        for (i = 0; i < longitudArreglo; i++) {
          idEmpresa = respuesta[i]["idEmpresa"];

          var imagen =
            "../../site/a/" +
            idEmpresa +
            "/productos/" +
            respuesta[i]["imagen"];
          content +=
            '<tr><tr class="divContenido"><td width="20%">' +
            respuesta[i]["nombre"] +
            '</td><td width="25%">' +
            '<img src="' +
            imagen +
            '" height="140px";>' +
            '</td><td width="10%" class="text-center">' +
            respuesta[i]["cantidad"] +
            '</td><td width="20%" class="text-center">' +
            "$" +
            respuesta[i]["preciounitario"] +
            '</td><td width="20%" class="text-center">' +
            "$" +
            (respuesta[i]["cantidad"] * respuesta[i]["preciounitario"]).toFixed(
              2
            ) +
            "</td></tr>";
          total =
            total + respuesta[i]["cantidad"] * respuesta[i]["preciounitario"];
        }
        content += "</tr>";
        contentTotal =
          '<tr class="divTotal"><td colspan="4" align="right"><h3>' +
          "Total" +
          "</h3></td>";
        contentTotal +=
          '<td align="right"><h3>' + "$" + total.toFixed(2) + "</h3></td></tr>";

        $("#tablaVenta").append(content);
        $("#tablaVenta").append(contentTotal);
        $("#tablaVenta").show();
        $("#modal-default").modal("show");
      }
    },
  });
}

function Entregado(id) {
  $.ajax({
    type: "POST",
    url: "ventasModelo.php?option=modificarConsultar&id=" + id,
    dataType: "json",
    data: $(this).serialize(),
    success: function (respuesta) {
      if (respuesta.error == 1) {
        swal(
          "Houston, tenemos un problema",
          "Esta venta fue eliminada!",
          "error"
        );
      }
      if (respuesta.error == "1eng") {
        swal(
          "Houston, we have a problem",
          "This sale was eliminated!",
          "error"
        );
      }
      if (respuesta.error == 2) {
        swal(
          "Houston, tenemos un problema",
          "Esta venta no fue encontrada!",
          "error"
        );
      }
      if (respuesta.error == "2eng") {
        swal("Houston, we have a problem", "This sale was not found!", "error");
      }
      if (respuesta.error == 3) {
        swal(
          "Houston, tenemos un problema",
          "Debe completar todos los datos!",
          "error"
        );
      }
      if (respuesta.error == "3eng") {
        swal(
          "Houston, we have a problem",
          "You must complete all the data!",
          "error"
        );
      }

      if (respuesta[0]["exito"] == 1) {
        jQuery(".divContenido").remove();
        jQuery(".divTotal").remove();
        var longitudArreglo = respuesta.length;
        document.querySelector("#titleModal").innerHTML = "Detalle de venta";
        document
          .querySelector(".modal-header")
          .classList.replace("headerRegister", "headerUpdate");
        document
          .querySelector("#btnActionForm")
          .classList.replace("btn-primary", "btn-info");
        $("button.website").show();
        document.querySelector("#btnText").innerHTML = "Entregar";
        document.querySelector("#btnTextCancelar").innerHTML = "Cerrar";
        var i = 0;
        var total = 0;
        var contentTotal = "<tr>";
        var content = "";
        var idEmpresa = "";
        for (i = 0; i < longitudArreglo; i++) {
          idEmpresa = respuesta[i]["idEmpresa"];
          var imagen =
            "../../site/a/" +
            idEmpresa +
            "/productos/" +
            respuesta[i]["imagen"];
          content +=
            '<tr><tr class="divContenido"><td width="20%">' +
            respuesta[i]["nombre"] +
            '</td><td width="25%">' +
            '<img src="' +
            imagen +
            '" height="140px";>' +
            '</td><td width="10%" class="text-center">' +
            respuesta[i]["cantidad"] +
            '</td><td width="20%" class="text-center">' +
            "$" +
            respuesta[i]["preciounitario"] +
            '</td><td width="20%" class="text-center">' +
            "$" +
            (respuesta[i]["cantidad"] * respuesta[i]["preciounitario"]).toFixed(
              2
            ) +
            "</td></tr>";
          total =
            total + respuesta[i]["cantidad"] * respuesta[i]["preciounitario"];
        }
        content += "</tr>";
        contentTotal =
          '<tr class="divTotal"><td colspan="4" align="right"><h3>' +
          "Total" +
          "</h3></td>";
        contentTotal +=
          '<td align="right"><h3>' + "$" + total.toFixed(2) + "</h3></td></tr>";

        $("#tablaVenta").append(content);
        $("#tablaVenta").append(contentTotal);
        $("#tablaVenta").show();
        $("#modal-default").modal("show");
      }
      if (respuesta[0]["exito"] == "1eng") {
        jQuery(".divContenido").remove();
        jQuery(".divTotal").remove();
        var longitudArreglo = respuesta.length;
        document.querySelector("#titleModal").innerHTML = "Sale detail";
        document
          .querySelector(".modal-header")
          .classList.replace("headerRegister", "headerUpdate");
        document
          .querySelector("#btnActionForm")
          .classList.replace("btn-primary", "btn-info");
        $("button.website").show();
        document.querySelector("#btnText").innerHTML = "Deliver";
        document.querySelector("#btnTextCancelar").innerHTML = "Close";
        var i = 0;
        var total = 0;
        var contentTotal = "<tr>";
        var content = "";
        var idEmpresa = "";
        for (i = 0; i < longitudArreglo; i++) {
          idEmpresa = respuesta[i]["idEmpresa"];
          var imagen =
            "../../site/a/" +
            idEmpresa +
            "/productos/" +
            respuesta[i]["imagen"];
          content +=
            '<tr><tr class="divContenido"><td width="20%">' +
            respuesta[i]["nombre"] +
            '</td><td width="25%">' +
            '<img src="' +
            imagen +
            '" height="140px";>' +
            '</td><td width="10%" class="text-center">' +
            respuesta[i]["cantidad"] +
            '</td><td width="20%" class="text-center">' +
            "$" +
            respuesta[i]["preciounitario"] +
            '</td><td width="20%" class="text-center">' +
            "$" +
            (respuesta[i]["cantidad"] * respuesta[i]["preciounitario"]).toFixed(
              2
            ) +
            "</td></tr>";
          total =
            total + respuesta[i]["cantidad"] * respuesta[i]["preciounitario"];
        }
        content += "</tr>";
        contentTotal =
          '<tr class="divTotal"><td colspan="4" align="right"><h3>' +
          "Total" +
          "</h3></td>";
        contentTotal +=
          '<td align="right"><h3>' + "$" + total.toFixed(2) + "</h3></td></tr>";

        $("#tablaVenta").append(content);
        $("#tablaVenta").append(contentTotal);
        $("#tablaVenta").show();
        $("#modal-default").modal("show");
      }
    },
  });

  $("body").on("submit", "#formDefault", function (event) {
    event.preventDefault();
    if ($("#formDefault").valid()) {
      $.ajax({
        type: "POST",
        url: "ventasModelo.php?option=modificar&id=" + id,
        dataType: "json",
        data: $(this).serialize(),
        success: function (respuesta) {
          if (respuesta.error == 1) {
            swal(
              "Houston, tenemos un problema",
              "Esta venta ya existe!",
              "error"
            );
          }
          if (respuesta.error == "1eng") {
            swal(
              "Houston, we have a problem",
              "This sale already exists!",
              "error"
            );
          }
          if (respuesta.error == 2) {
            swal(
              "Houston, tenemos un problema",
              "Debe completar todos los datos!",
              "error"
            );
          }
          if (respuesta.error == "2eng") {
            swal(
              "Houston, we have a problem",
              "You must complete all the data!",
              "error"
            );
          }
          if (respuesta.error == 3) {
            swal(
              "Houston, tenemos un problema",
              "Debe introducir correctamente los datos! evite usar caracteres especiales",
              "error"
            );
          }
          if (respuesta.error == "3eng") {
            swal(
              "Houston, we have a problem",
              "You must enter the data correctly! Avoid using special characters",
              "error"
            );
          }
          if (respuesta.exito == 1) {
            document.querySelector("#btnTextCancelar").innerHTML = "Cerrar";
            window.location.href = "index.php";
          }
          if (respuesta.exito == "1eng") {
            document.querySelector("#btnTextCancelar").innerHTML = "Close";
            window.location.href = "index.php";
          }
        },
      });
    }
  });
}

function Eliminar(id, lang) {
  var title;
  var text;
  if (lang == "es") {
    title = "¿Está seguro de eliminar este registro?";
    text = "Una vez eliminado, ¡no podrá recuperar este registro!";
  }
  if (lang == "en") {
    title = "¿Are you sure to delete this record?";
    text = "Once deleted, you will not be able to recover this record!!";
  }
  swal({
    title: title,
    text: text,
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      $.ajax({
        type: "POST",
        url: "ventasModelo.php?option=eliminar&id=" + id,
        dataType: "json",
        data: $(this).serialize(),
        success: function (respuesta) {
          if (respuesta.error == 1) {
            swal(
              "Houston, tenemos un problema",
              "Esta contacto no fue encontrado!",
              "error"
            );
          }
          if (respuesta.error == "1eng") {
            swal(
              "Houston, we have a problem",
              "This contact was not found!",
              "error"
            );
          }
          if (respuesta.exito == 1) {
            window.location.href = "index.php";
          }
          if (respuesta.exito == "1eng") {
            window.location.href = "index.php";
          }
        },
      });
    }
  });
}
