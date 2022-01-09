const _ = require('lodash')
const Color = require('color')
const {color_names} = require('./color_names')
const {hues, saturations, luminances} = require('./color_labels')

new Vue({
    el: "#app",

    data() {
        return {
            include_amoled: false,
            color_mode: 'hex',

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
            if (this.color_mode === 'hex') {
                return this.hexColors
            } else {
                return this.namedColors
            }
        },

        hexColors() {
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
        },

        namedColors() {
            return color_names.filter(name => {
                const c = Color(name.toLowerCase())

                if (this.light.contrast(c) < this.light_contrast) {
                    return false
                }

                if (this.dark.contrast(c) < this.dark_contrast) {
                    return false
                }

                if (this.include_amoled) {
                    if (this.amoled.contrast(c) < this.dark_contrast) {
                        return false
                    }
                }

                return true
            })
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
            props: ['color'],

            computed: {
                colorLabel() {
                    const c = this.color

                    if (this.$root.color_mode === 'web') {
                        return this.capitalCase(c)
                    }

                    let closest = color_names[0]
                    let closest_diff = 1000

                    for (let c2 of color_names) {
                        const diff = this.diff(c, c2.toLowerCase())

                        if (diff < closest_diff) {
                            closest = c2
                            closest_diff = diff
                        }
                    }

                    if (closest_diff >= 13.5) {
                        return this.improvise()
                    }

                    return this.capitalCase(closest)
                },

                colorName() {
                    if (this.$root.color_mode === 'web') {
                        return this.capitalCase(this.color)
                    }

                    return this.color
                }
            },

            methods: {
                diff(c1, c2) {
                    c1 = Color(c1)
                    c2 = Color(c2)

                    let h = Math.abs(c1.hue() - c2.hue())
                    let s = Math.abs(c1.saturationv() - c2.saturationv())
                    let l = Math.abs(c1.luminosity() - c2.luminosity()) * 100

                    return (h*2.8 + s + l*2) / 3
                },

                capitalCase(string) {
                    const result = string.replace(/([A-Z])/g, " $1");
                    return result.charAt(0).toUpperCase() + result.slice(1);
                },

                improvise() {
                    lum_name = this.closest(luminances, "luminosity")
                    sat_name = this.closest(saturations, "saturationv")
                    hue_name = this.closest(hues, "hue")

                    return this.capitalCase(lum_name + sat_name + hue_name)
                },

                closest(values, func) {
                    const c = Color(this.color)

                    if (values === hues && c.saturationv() < 5) {
                        return "Gray"
                    }

                    if (values === saturations && c.saturationv() < 5) {
                        return ""
                    }

                    let closest = ""
                    let closest_diff = 100
                    for (const [key, val] of Object.entries(values)) {
                        const diff = Math.abs(val - c[func]())

                        if (diff < closest_diff) {
                            closest = key
                            closest_diff = diff
                        }
                    }

                    return closest
                }
            }
        }
    },
})
