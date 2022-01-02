const _ = require('lodash')
const Color = require('color')

new Vue({
    el: "#app",

    data() {
        return {
            include_amoled: false,

            color_count: 8,
            shade_count: 1,
            lum_count: 1,
            gray_count: 2,

            light: Color("#ffffff"),
            dark: Color("#36393f"),
            amoled: Color("#000000"),

            light_contrast: 2,
            dark_contrast: 3,
        }
    },

    computed: {
        colors() {
            const colors = []

            const shades = _.range(100, 0, -100 / this.shade_count)
            const hues = _.range(0, 360, 360 / this.color_count)
            const lums = _.range(100 / (this.lum_count + 1), 100, 100 / (this.lum_count + 1))
            const grays = _.range(1, 110, 99 / (this.gray_count - 1))

            hues.map(hue => {
                lums.map(lum => {
                    colors.push(...
                        shades.map(shade => {
                            return Color(`hsl(${hue}, ${shade}%, ${lum}%)`)
                        })
                    )
                })
            })

            colors.push(...
                grays.map(gray => {
                    return Color(`hsl(0, 0%, ${gray}%)`)
                })
            )

            return colors.map((c) => {
                return this.adjust(c).hex()
            }).filter((v, i, a) => a.indexOf(v) === i)
        }
    },

    methods: {
        adjust(c) {
            const by = 0.005
            const steps = 1000

            darkened = 0
            while (this.light.contrast(c) < this.light_contrast && darkened < steps) {
                c = c.darken(by)
                darkened++
            }

            if (this.include_amoled) {
                lightened = 0
                while (this.amoled.contrast(c) < this.dark_contrast && lightened < steps) {
                    c = c.lighten(by)
                    lightened++
                }
            }

            lightened = 0
            while (this.dark.contrast(c) < this.dark_contrast && lightened < steps) {
                c = c.lighten(by)
                lightened++
            }

            return c
        }
    },

    watch: {
        color_count(val) {
            this.color_count = parseInt(val)
        },

        shade_count(val) {
            this.shade_count = parseInt(val)
        },

        lum_count(val) {
            this.lum_count = parseInt(val)
        },

        gray_count(val) {
            this.gray_count = parseInt(val)
        },

        light_contrast(val) {
            this.light_contrast = parseFloat(val)
        },

        dark_contrast(val) {
            this.dark_contrast = parseFloat(val)
        },
    },

    components: {
        'message': {
            template: "#message-template",
            props: ['color']
        }
    },
})
