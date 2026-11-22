using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;

[assembly: AssemblyTitle("CalClip.IN")]
[assembly: AssemblyDescription("CalClip.IN Desktop Video Clipper & Motion AI Launcher")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("CalClip Open Source")]
[assembly: AssemblyProduct("CalClip.IN")]
[assembly: AssemblyCopyright("Copyright © 2026 CalClip Open Source")]
[assembly: AssemblyTrademark("CalClip.IN")]
[assembly: AssemblyCulture("")]
[assembly: ComVisible(false)]
[assembly: AssemblyVersion("2.1.0.0")]
[assembly: AssemblyFileVersion("2.1.0.0")]

namespace CalClipLauncher
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string studioScript = Path.Combine(appDir, "alat", "studio", "studio.py");

            // Cari pythonw.exe (GUI tanpa jendela CMD hitam)
            string pythonw = Path.Combine(appDir, "python", "pythonw.exe");
            if (!File.Exists(pythonw))
            {
                string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string[] candidates = new string[]
                {
                    Path.Combine(localApp, "Programs", "Studio Maliki", "python", "pythonw.exe"),
                    Path.Combine(localApp, "Programs", "Python", "Python312", "pythonw.exe"),
                    Path.Combine(localApp, "Programs", "Python", "Python313", "pythonw.exe"),
                    Path.Combine(localApp, "Programs", "Python", "Python311", "pythonw.exe")
                };

                foreach (string c in candidates)
                {
                    if (File.Exists(c))
                    {
                        pythonw = c;
                        break;
                    }
                }
            }

            if (!File.Exists(pythonw))
            {
                pythonw = "pythonw.exe";
            }

            try
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = pythonw;
                psi.Arguments = "\"" + studioScript + "\"";
                psi.WorkingDirectory = Path.Combine(appDir, "alat", "studio");
                psi.UseShellExecute = false;
                psi.CreateNoWindow = true;
                psi.WindowStyle = ProcessWindowStyle.Hidden;

                // Set environment variabel untuk data mandiri dan runtime terbundel
                string calclipData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "CalClip");
                psi.EnvironmentVariables["STUDIO_DATA"] = calclipData;

                string pythonExe = Path.Combine(appDir, "python", "python.exe");
                string uvExe = Path.Combine(appDir, "bin", "uv.exe");
                if (File.Exists(pythonExe)) psi.EnvironmentVariables["STUDIO_PY"] = pythonExe;
                if (File.Exists(uvExe)) psi.EnvironmentVariables["STUDIO_UV"] = uvExe;

                Process.Start(psi);
            }
            catch (Exception ex)
            {
                System.Windows.Forms.MessageBox.Show(
                    "Gagal menjalankan CalClip.IN:\n" + ex.Message,
                    "CalClip.IN Launcher",
                    System.Windows.Forms.MessageBoxButtons.OK,
                    System.Windows.Forms.MessageBoxIcon.Error
                );
            }
        }
    }
}
