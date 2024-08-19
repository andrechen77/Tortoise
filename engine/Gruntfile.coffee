module.exports = (grunt) ->

  massAlias =
    (glob, base, prefix = "") ->
      files      = grunt.file.expand({ filter: 'isFile' }, glob)
      truePrefix = if prefix is "" then "" else "#{prefix}/"
      regex      = new RegExp(".*?/" + base + "/(.*)\.js")
      splitter = (file) ->
        alias = file.match(regex)[1]
        "#{file}:#{truePrefix}#{alias}"
      files.map(splitter)

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      compile: {
        files: [
          {
            expand: true,
            cwd: 'src/main/coffee',
            src: ['**/*.coffee'],
            dest: 'target/classes/js/tortoise',
            ext: '.js'
          }
        ]
      }
    },
    browserify: {
      main: {
        src: ['target/classes/js/tortoise/bootstrap.js'],
        dest: 'target/classes/js/tortoise-engine.js',
        options: {
          alias: [],
          plugin: [
            "esmify",
            "wasmify",
          ],
        }
      }
    },
    run: {
      # use the `wasm-pack` command to create a package in `node_modules` that
      # contains the compiled WebAssembly code, which the engine can `require`
      # as normal
      build_wasm: {
        cmd: "npx",
        args: [
          "wasm-pack",
          "build",
          "--target",
          "bundler",
          "--out-dir",
          "node_modules/tortoise-engine-wasm"
        ],
        options: {
          quiet: Infinity, # prints all output to stderr which we want to ignore
        },
      },
    },
  })

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-run')

  grunt.task.registerTask('fix_require', 'Changes "require" varname to "tortoise_require"', ->
    filepath    = './target/classes/js/tortoise-engine.js'
    strContents = grunt.file.read(filepath)
    grunt.file.write(filepath, "tortoise_#{strContents}")
    return
  )

  # I do this because inlining it in `browserify`'s options causes the value to
  # be evaluated before any of the tasks are run, but we need to wait until
  # `coffee` runs for this to work --JAB (8/21/14)
  grunt.task.registerTask('gen_aliases', 'Find aliases, then run browserify', ->
    aliases = ["./node_modules/mori/mori.js:mori"].
                concat(massAlias('./target/classes/js/tortoise/**/*.js', 'tortoise')).
                concat(massAlias('./node_modules/brazierjs/*.js', 'brazierjs', 'brazier'))
    grunt.config(['browserify', 'main', 'options', 'alias'], aliases);
    return
  )

  grunt.registerTask('default', ['coffee', 'run:build_wasm', 'gen_aliases', 'browserify', 'fix_require'])
