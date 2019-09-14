Vue.component('modal', {
    template: `
		<div class="modal is-active">
			<div class="modal-background"></div>
			<div class="modal-content">
				<div class="box">
				    <form action="/">
					    <h2>Choose a city and a service</h2>
                        <p>
                            <select class="myserv" v-model="serv">
                                <option disabled>Choose a service</option>
                                <option v-for="serv in services" :value="serv">{{serv}}</option>
                            </select>
                        </p>
                        <p>
                            <select class="mycity" v-model="city">
                                <option disabled>Choose a city</option>
                                <option v-for="city in cities" :value="city">{{city}}</option>                               
                            </select>
                        </p>
                        <span v-if="nosc">Select a service and a city!</span>
                        <span v-if="nos">Select a service!</span>
                        <span v-if="noc">Select a city!</span>
					    <button @click="onchosen">Choose</button>
				    </form>
				</div>
			</div>
			<button class="modal-close" @click="$emit('close')"></button>
		</div>
	`,

    data() {
        return {
            services: ['accuweather', 'apixu'],
            cities: ['yekb', 'spb', 'irk'],
            serv: '',
            city:'',
            nosc: false,
            nos: false,
            noc: false
        }
    },
    mounted() {
        if (document.cookie!='')
            this.getCookie();
    },
    methods: {
        onchosen() {
            this.selectservcity(this.serv, this.city);
        },
        S4() {
            return(((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        },
        guid() {
            return (this.S4() + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4());
        },
        setCookie(serv, city) {
            document.cookie = "user=" + this.guid()+"_serv=" + serv + "_city=" + city;
        },
        getCookie() {
            var servcity = document.cookie.substring(42, document.cookie.length);
            var s = servcity.substring(5, servcity.indexOf('_'));
            var c = servcity.substring(servcity.indexOf('_') + 6, servcity.length);
            $('.myserv option:contains("' + s + '")').prop('selected', true);
            $('.mycity option:contains("' + c + '")').prop('selected', true);
        },
        updateCookie(serv, city) {
            var str = document.cookie.substring(0, 42) + "serv=" + serv + "_city=" + city;
            document.cookie = str;
        },
        selectservcity(serv, city) {
            serv = $('.myserv option:selected').text();
            city = $('.mycity option:selected').text();
            if ((!serv == '') && (!city == ''))
            {
                this.$emit('chosen', serv, city);
                this.nosc = false;
                this.nos = false;
                this.noc = false;
                if (document.cookie == '')
                    this.setCookie(serv, city);
                else
                    this.updateCookie(serv, city);          
            }
            else
            {
                if ((serv == '') && (city == ''))
                    this.nosc = true;
                if ((serv == '') && (city != ''))
                    this.nos = true;
                if ((city == '') && (serv != ''))
                    this.noc = true;
            }
        }
    }
});
//---------------------------------------------------

new Vue({
    el: '#root',
    data() {
        return {
            showModal: false,
            notEmpty: false,
            temp: '',
            cloud: '',
            wind: '',
            rain: '',
            serv: '',
            name: ''
        }
    },

    methods: {
        
        loader(serv, city)
        {
            if ((serv != '') && (city != '')) {
                this.showModal = false;
                var str1 = '';
                var str2 = '';
                var id = 0;
                switch (serv) {
                    case 'accuweather':
                        switch (city) {
                            case 'yekb': id = 295863; this.name = 'Yekaterinburg'; break;
                            case 'spb': id = 295212; this.name = 'Saint-Petersburg'; break;
                            case 'irk': id = 292712; this.name = 'Irkutsk'; break;
                            default: break;
                        }
                        this.loadFromAccu(this.name, id);
                        setInterval(this.loadFromAccu, 60000, this.name, id);
                        break;
                    case 'apixu':
                        switch (city) {
                            case 'yekb': this.name = 'Yekaterinburg'; break;
                            case 'spb': this.name = 'Saint-Petersburg'; break;
                            case 'irk': this.name = 'Irkutsk'; break;
                            default: break;
                        }
                        this.loadFromApixu(this.name);
                        setInterval(this.loadFromApixu, 300000, this.name);
                        break;
                    default:
                        break;
                }
            }
        },

        loadFromAccu(name,id) {
            this.notEmpty = true;
            var str1 = 'https://dataservice.accuweather.com/currentconditions/v1/' + id + '?apikey=hdvY18uKdGng6tYLfzSxGpS3tsbmQgVF%20&language=ru-ru&details=true';
            var t = '';
            var c = '';
            var w = '';
            var r = '';
            $.ajax({
                url: str1,
                accepts: "application/x-json",
                dataType: "json", 
                async:false,
                success: function (data) { 
                    t = data[0].Temperature.Metric.Value + '*C';
                    c = data[0].WeatherText;
                    let wind = data[0].Wind.Speed.Metric.Value * 1000 / 3600;
                    w = wind.toFixed(2) + 'м/с';
                    r = data[0].PrecipitationType;
                    if (r == null)
                        r = 'No';
                    console.log(t + ' ' + c + ' ' + w + ' ' + r); 
                },
                error: function () {
                    alert('No data!');
                }
            });
            this.temp = t; this.cloud = c; this.wind = w; this.rain = r;
            this.serv = 'AccuWeather'; this.name = name;
        },
        loadFromApixu(name)
        {
            this.notEmpty = true;
            var str2 = 'https://api-cdn.apixu.com/v1/current.json?key=bebd217500fd4565952133039190709&q=' + name;
            var t = '';
            var c = '';
            var w = '';
            var r = '';
            var self = this;
            $.ajax({
                url: str2,
                accepts: "application/x-json",
                dataType: "json",
                async: false,
                success: function (json) {
                    t = json.current.temp_c + '*C';
                    c = json.current.condition.text;
                    let wind = json.current.wind_kph * 1000 / 3600;
                    w = wind.toFixed(2) + 'м/с';
                    r = json.current.precip_mm + '';
                    if (r == '0')
                        r = 'No';
                    console.log(t + ' ' + c + ' ' + w + ' ' + r);
                },
                error: function () {
                    alert('No data!');
                }
            });
            this.temp = t; this.cloud = c; this.wind = w; this.rain = r;
            this.serv = 'Apixu'; this.name = name;
        }
    }
});
