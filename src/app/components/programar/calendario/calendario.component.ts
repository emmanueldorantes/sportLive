import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import 'moment-timezone';
declare var $: any;

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {
  events: any = [];

  ngOnInit(): void {
    const calendar = this;
    const horaActual = moment().tz('America/Mexico_city').format('YYYY-MM-DD HH:mm:ss');
    console.log(horaActual);

    this.events = [
      {
        title: 'Equipo 1 - Equipo 2',
        start: '2014-11-01T16:00:00',
        color: '#26A69A'
      },
      {
        title: 'Equipo 3 - Equipo 4',
        start: '2014-11-07T19:00:00'
      },
      {
        title: 'Equipo 5 - Equipo 6',
        start: '2014-11-11T21:00:00',
      }
    ];

    $(document).ready(function () {
      $('.fullcalendar-basic').fullCalendar({
        lang: 'es',
        header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,basicWeek,basicDay'
        },
        dayNamesShort: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        monthNames: [
          'Enero', // Cambia el nombre de enero
          'Febrero', // Cambia el nombre de febrero
          'Marzo', // Cambia el nombre de marzo
          'Abril', // Cambia el nombre de abril
          'Mayo', // Cambia el nombre de mayo
          'Junio', // Cambia el nombre de junio
          'Julio', // Cambia el nombre de julio
          'Agosto', // Cambia el nombre de agosto
          'Septiembre', // Cambia el nombre de septiembre
          'Octubre', // Cambia el nombre de octubre
          'Noviembre', // Cambia el nombre de noviembre
          'Diciembre' // Cambia el nombre de diciembre
        ],
        titleFormat: {
          month: 'MMMM YYYY', // Formato del título para la vista de mes
          week: "MMM D YYYY", // Formato del título para la vista de semana
          day: 'dddd, MMM D YYYY' // Formato del título para la vista de día
        },
        dayHeaderFormat: {
          // Personaliza el formato de los encabezados de día en la vista de día
          day: 'dddd', // Muestra solo el nombre completo del día (por ejemplo, "lunes")
          // Personaliza el formato de los encabezados de día en la vista de semana
          week: 'dddd', // Muestra solo el nombre completo del día (por ejemplo, "lunes")
        },
        defaultDate: '2014-11-12',
        editable: true,
        events: calendar.events,   
        eventRender: function(event: any, element: any) {
          let formattedStart = moment(event.start._i).format('h:mm A');
          let headerHtml = '<div class="event-header">Partido</div>';
          let headerTime = '<div class="event-header">Horario: '+formattedStart+'</div>';
          element.find('.fc-time').html(headerTime);
          element.find('.fc-title').before(headerHtml);
        },     
        eventClick: function (info: any) {
          console.log('Event: ' + info.title)
          console.log('Time: ' + info.start._i)
        }
      });
    });
  }
}