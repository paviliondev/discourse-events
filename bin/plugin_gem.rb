# frozen_string_literal: true

module PluginGem
  def self.load(path, name, version, opts = nil)
    opts ||= {}

    gems_path = File.dirname(path) + "/gems/#{RUBY_VERSION}"

    spec_path = gems_path + "/specifications"

    if opts[:local]
      spec_file = spec_path + "/#{File.basename(name, ".gem")}.gemspec"
    else
      spec_file = spec_path + "/#{name}-#{version}"
      spec_file += "-#{opts[:platform]}" if opts[:platform]
      spec_file += ".gemspec"
    end

    unless File.exist? spec_file
      command =
        "gem install #{name} -v #{version} -i #{gems_path} --no-document --ignore-dependencies --no-user-install"
      command += " --source #{opts[:source]}" if opts[:source]
      puts command

      Bundler.with_unbundled_env { puts `#{command}` }
    end

    if File.exist? spec_file
      Gem.path << gems_path
      Gem::Specification.load(spec_file).activate

      require opts[:require_name] ? opts[:require_name] : name unless opts[:require] == false
    else
      puts "You are specifying the gem #{name} in #{path}, however it does not exist!"
      puts "Looked for: #{spec_file}"
      exit(-1)
    end
  end
end
