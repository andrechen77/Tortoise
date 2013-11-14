val root = project in file (".") configs(Testing.configs: _*)

scalaVersion := "2.10.3"

scalacOptions ++=
  "-deprecation -unchecked -feature -Xcheckinit -encoding us-ascii -target:jvm-1.7 -Xlint -Xfatal-warnings"
  .split(" ").toSeq

// only log problems plz
ivyLoggingLevel := UpdateLogging.Quiet

// we're not cross-building for different Scala versions
crossPaths := false

libraryDependencies ++= Seq(
  "org.nlogo" % "NetLogoHeadless" % "5.1.0-SNAPSHOT-671340d" from
    "http://ccl.northwestern.edu/devel/NetLogoHeadless-671340d.jar",
  "org.nlogo" % "NetLogoHeadlessTests" % "5.1.0-SNAPSHOT-671340d" from
    "http://ccl.northwestern.edu/devel/NetLogoHeadlessTests-671340d.jar",
  "org.json4s" %% "json4s-native" % "3.1.0",
  "org.webjars" % "json2" % "20110223",
  "org.scalacheck" %% "scalacheck" % "1.10.1" % "test",
  "org.scalatest" %% "scalatest" % "2.0" % "test",
  "org.skyscreamer" % "jsonassert" % "1.1.0" % "test"
)

onLoadMessage := ""

Testing.settings

Coffee.settings
