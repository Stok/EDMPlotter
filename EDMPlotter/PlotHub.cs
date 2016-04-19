using System;
using System.Web;
using System.Collections.Generic;
using System.Threading;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;

namespace EDMPlotter
{
	public class PlotHub : Hub
	{
        private readonly Experiment _experiment;

        public PlotHub() : this(Experiment.Instance) { }

        public PlotHub(Experiment e)
        {
           _experiment = e;
        }

        public void StartPlotting()
		{
            Experiment.Instance.StartExperiment();
		}

        public void StopPlotting()
        {
            Experiment.Instance.StopExperiment();
        }

        public void ClearAll()
        {
            Experiment.Instance.ClearExperiment();
        }

        public void Save(string path)
        {
            Experiment.Instance.SaveExperiment(path);
        }

    }


    
}

